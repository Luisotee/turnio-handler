import express, { Request, Response } from "express";
import { RacRequestBody } from "../types/rac";
import { login } from "../utils/auth";
import { convertStateToUF, convertRacType } from "../utils/transforms";
import fetch from "node-fetch";

const router = express.Router();

function getFriendlyErrorMessage(errorText: string): string {
  if (errorText.includes("validation failed")) {
    return "Alguns dados estão incorretos ou faltando";
  }
  if (errorText.includes("unauthorized")) {
    return "Suas credenciais expiraram, faça login novamente";
  }
  if (errorText.includes("duplicate")) {
    return "Já existe um RAC registrado com esses dados";
  }
  return "Ocorreu um erro inesperado";
}

// @ts-ignore
router.post("/", async (req: Request<{}, {}, RacRequestBody>, res: Response) => {
  try {
    console.log("\n=== REQUEST BODY ===");
    console.log(JSON.stringify(req.body, null, 2));

    const {
      municipality,
      state,
      rac_type,
      users_involved,
      start_rac_date,
      start_rac_time,
      cpf,
      password,
      location,
    } = req.body;

    console.log("\n=== LOGGING IN ===");
    const jwtToken = await login({ cpf, password });
    console.log("Login successful, token received");

    // Clean up and format time to HH:MM
    const cleanTime = start_rac_time
      .replace(/[~T\[\]]/g, "") // Remove ~T[] wrapper
      .split(":") // Split by :
      .slice(0, 2) // Take only hours and minutes
      .join(":"); // Join back with :

    const racPayload = {
      municipality,
      state: convertStateToUF(state),
      rac_type: convertRacType(rac_type),
      users_involved: parseInt(users_involved, 10),
      start_rac_date,
      start_rac_time: cleanTime,
      local_especification: "N/A", // Default value if not provided
      commentary: "N/A", // Default value if not provided
      location: {
        type: "Point",
        coordinates: [
          parseFloat(location.coordinates[0]),
          parseFloat(location.coordinates[1]),
        ],
      },
    };

    console.log("\n=== SENDING RAC REQUEST ===");
    console.log("RAC Payload:", JSON.stringify(racPayload, null, 2));

    const racResponse = await fetch("https://caminhodofogo.com.br/api/racs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(racPayload),
    });

    if (!racResponse.ok) {
      const errorText = await racResponse.text();
      const friendlyMessage =
        `❌ Não foi possível registrar o RAC\n\n` +
        `Motivo: ${getFriendlyErrorMessage(errorText)}\n\n` +
        `Por favor, tente novamente ou entre em contato com o suporte se o problema persistir. 🔧`;

      throw new Error(friendlyMessage);
    }

    const responseData = await racResponse.json();
    console.log("Response status:", racResponse.status);
    console.log("Response data:", responseData);

    // Generate friendly success message
    const racTypeInPortuguese =
      {
        prevention: "Prevenção",
        firefighting: "Monitoramento",
        environmental_education: "Educação Ambiental",
      }[racPayload.rac_type] || racPayload.rac_type;

    const message =
      `✅ RAC registrado com sucesso!\n\n` +
      `📍 Local: ${municipality}, ${state}\n` +
      `📋 Tipo: ${racTypeInPortuguese}\n` +
      `👥 Participantes: ${users_involved}\n` +
      `📅 Data: ${start_rac_date}\n` +
      `🕐 Horário: ${cleanTime}\n\n` +
      `Obrigado por contribuir com o monitoramento! 🌿`;

    return res.status(200).json({ message });
  } catch (error) {
    console.error("\n=== ERROR ===");
    console.error("Error processing RAC request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      message: errorMessage.includes("❌")
        ? errorMessage
        : "❌ Ocorreu um erro ao registrar o RAC. Por favor, tente novamente mais tarde. 🔧",
    });
  }
});

export default router;
