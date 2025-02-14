import express, { Request, Response } from "express";
import path from "path";
import { AlertRequestBody } from "../types/alert";
import { AudioResponse, ImageResponse, MediaItem } from "../types/fire";
import { login } from "../utils/auth";
import { cleanupMedia, downloadMedia, isValidMediaId } from "../utils/media";
import { convertStateToUF, parseDateToISO } from "../utils/transforms";
import { uploadFile } from "../utils/upload";
import fetch from "node-fetch";

const router = express.Router();

// @ts-ignore
router.post("/", async (req: Request<{}, {}, AlertRequestBody>, res: Response) => {
  const downloadedFiles: string[] = [];

  try {
    console.log("\n=== REQUEST BODY ===");
    console.log(JSON.stringify(req.body, null, 2));

    const {
      lat,
      lon,
      municipality,
      state,
      local_especification,
      commentary,
      imageId,
      audioId,
      cpf,
      password,
    } = req.body;

    if (imageId && isValidMediaId(imageId, "images")) {
      console.log("\n=== DOWNLOADING IMAGE ===");
      const imagePath = await downloadMedia(imageId, "images");
      console.log("Image downloaded to:", imagePath);
      downloadedFiles.push(imagePath);
    }

    if (audioId && isValidMediaId(audioId, "audios")) {
      console.log("\n=== DOWNLOADING AUDIO ===");
      const audioPath = await downloadMedia(audioId, "audios");
      console.log("Audio downloaded to:", audioPath);
      downloadedFiles.push(audioPath);
    }

    console.log("\n=== LOGGING IN ===");
    const jwtToken = await login({ cpf, password });
    console.log("Login successful, token received");

    const alertPayload = {
      municipality,
      state: convertStateToUF(state),
      alert_date: new Date().toISOString(), // Generate current timestamp
      local_especification,
      location: {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)],
      },
      commentary,
      images: [] as MediaItem[],
      audios: [] as MediaItem[],
      alert_seq: "",
      false_alert: false,
      false_alert_commentary: "",
      nasa_api: {},
      fire: null,
    };

    if (downloadedFiles.length > 0) {
      for (const filePath of downloadedFiles) {
        const fileName = path.basename(filePath);
        const type = fileName.endsWith(".jpg") ? "images" : "audios";
        try {
          const uploadResponse = await uploadFile(filePath, type, jwtToken);
          if (type === "images") {
            alertPayload.images.push({
              url: uploadResponse.url,
              thumb: (uploadResponse as ImageResponse).thumb,
            });
          } else {
            alertPayload.audios.push({
              url: uploadResponse.url,
              title: (uploadResponse as AudioResponse).title,
            });
          }
        } catch (error) {
          console.error(`Failed to upload ${type}:`, error);
          throw error;
        }
      }
    }

    console.log("\n=== SENDING ALERT REQUEST ===");
    const alertResponse = await fetch("https://caminhodofogo.com.br/api/alerts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alertPayload),
    });

    // Log raw response
    const rawResponse = await alertResponse.text();
    console.log("Response status:", alertResponse.status);
    console.log("Raw response:", rawResponse);

    // Handle non-200 responses
    if (!alertResponse.ok) {
      throw new Error(`Alert API error: ${alertResponse.status} - ${rawResponse}`);
    }

    // Try parsing JSON only for successful responses
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${rawResponse}`);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("\n=== ERROR ===");
    console.error("Error processing alert request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(`Error processing the alert request: ${errorMessage}`);
  } finally {
    console.log("\n=== CLEANUP ===");
    await cleanupMedia(...downloadedFiles);
    console.log("Cleaned up files:", downloadedFiles);
  }
});

export default router;
