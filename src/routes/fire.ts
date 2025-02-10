import express, { Request, Response } from "express";
import path from "path";
import { AudioResponse, FireRequestBody, ImageResponse, MediaItem } from "../types/fire";
import { login } from "../utils/auth";
import { cleanupMedia, downloadMedia, isValidMediaId } from "../utils/media";
import {
  convertStateToUF,
  getFireStatusValue,
  parseDateToISO,
} from "../utils/transforms";
import { uploadFile } from "../utils/upload";
import fetch from "node-fetch";

const router = express.Router();

// @ts-ignore
router.post("/", async (req: Request<{}, {}, FireRequestBody>, res: Response) => {
  const downloadedFiles: string[] = [];

  try {
    console.log("\n=== REQUEST BODY ===");
    console.log(JSON.stringify(req.body, null, 2));

    const {
      lat,
      lon,
      municipality,
      state,
      address,
      fire_date,
      fire_type,
      fire_name,
      fire_status,
      imageId,
      audioId,
      description,
      cpf,
      password,
    } = req.body;

    if (imageId && isValidMediaId(imageId, "images")) {
      console.log("\n=== DOWNLOADING IMAGE ===");
      const imagePath = await downloadMedia(imageId, "images");
      console.log("Image downloaded to:", imagePath);
      downloadedFiles.push(imagePath);
    } else if (imageId) {
      console.log("Invalid or skipped image ID:", imageId);
    }

    if (audioId && isValidMediaId(audioId, "audios")) {
      console.log("\n=== DOWNLOADING AUDIO ===");
      const audioPath = await downloadMedia(audioId, "audios");
      console.log("Audio downloaded to:", audioPath);
      downloadedFiles.push(audioPath);
    } else if (audioId) {
      console.log("Invalid or skipped audio ID:", audioId);
    }

    console.log("\n=== LOGGING IN ===");
    const jwtToken = await login({ cpf, password });
    console.log("Login successful, token received");
    console.log("Token:", jwtToken);

    const firePayload = {
      municipality,
      state: convertStateToUF(state),
      fire_date: parseDateToISO(fire_date),
      fire_name,
      fire_type,
      fire_status: getFireStatusValue(fire_status),
      address,
      description,
      area: 0,
      group: "N/A",
      priority: "low",
      location_reference: "N/A",
      location: {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)],
      },
      images: [] as MediaItem[],
      audios: [] as MediaItem[],
    };

    // Upload files first
    if (downloadedFiles.length > 0) {
      for (const filePath of downloadedFiles) {
        const fileName = path.basename(filePath);
        const type = fileName.endsWith(".jpg") ? "images" : "audios";
        try {
          const uploadResponse = await uploadFile(filePath, type, jwtToken);
          if (type === "images") {
            firePayload.images.push({
              url: uploadResponse.url,
              thumb: (uploadResponse as ImageResponse).thumb,
            });
          } else {
            firePayload.audios.push({
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

    console.log("\n=== SENDING FIRE REQUEST ===");
    console.log("Fire Payload:", JSON.stringify(firePayload, null, 2));

    const fireResponse = await fetch("https://caminhodofogo.com.br/api/fires", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firePayload),
    });

    const responseData = await fireResponse.json();
    console.log("Response status:", fireResponse.status);
    console.log("Response data:", responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("\n=== ERROR ===");
    console.error("Error processing /fire request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(`Error processing the fire request: ${errorMessage}`);
  } finally {
    console.log("\n=== CLEANUP ===");
    await cleanupMedia(...downloadedFiles);
    console.log("Cleaned up files:", downloadedFiles);
  }
});

export default router;
