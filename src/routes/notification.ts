import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { login } from "../utils/auth";
import { NotificationService } from "../services/notification";
import { NotificationCount } from "../types/notification";

const router = express.Router();
const notificationService = new NotificationService();

interface NotificationRequest {
  cpf: string;
  password: string;
}

router.post(
  "/count",
  // @ts-ignore
  async (req: Request<{}, {}, NotificationRequest>, res: Response) => {
    try {
      const { cpf, password } = req.body;

      console.log("\n=== LOGGING IN ===");
      const jwtToken = await login({ cpf, password });

      console.log("\n=== FETCHING NOTIFICATION COUNTS ===");
      const countResponse = await fetch(
        "https://caminhodofogo.com.br/api/notifications/count",
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      if (!countResponse.ok) {
        throw new Error(`Failed to fetch counts: ${countResponse.statusText}`);
      }

      const counts = (await countResponse.json()) as NotificationCount;
      const status = await notificationService.updateUserNotification(cpf, counts);

      return res.status(200).json(status);
    } catch (error) {
      console.error("\n=== ERROR ===");
      console.error("Error processing notification request:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res
        .status(500)
        .send(`Error processing notification request: ${errorMessage}`);
    }
  }
);

export default router;
