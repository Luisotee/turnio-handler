import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";
import { AudioResponse, ImageResponse, UploadResponse } from "../types/fire";

export async function uploadFile(
  filePath: string,
  type: "images" | "audios",
  jwtToken: string
): Promise<UploadResponse> {
  console.log(`\n=== UPLOADING ${type.toUpperCase()} ===`);
  console.log("File path:", filePath);

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const uploadUrl = `${process.env.CAMINHO_DO_FOGO_API}/uploads/${type}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as unknown;

  if (type === "images") {
    const imageData = data as ImageResponse;
    if (!imageData.url || !imageData.thumb) {
      throw new Error("Invalid image upload response: missing url or thumb");
    }
    return imageData;
  } else {
    const audioData = data as AudioResponse;
    if (!audioData.url || !audioData.title) {
      throw new Error("Invalid audio upload response: missing url or title");
    }
    return audioData;
  }
}
