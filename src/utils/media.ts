import fs from "fs";
import path from "path";

export const TURN_IO_TOKEN =
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUdXJuIiwiZXhwIjoxODA3OTE4NDM0LCJpYXQiOjE3Mzg4ODQ4NzQsImlzcyI6IlR1cm4iLCJqdGkiOiJiOGM1YmFiNC1mZTczLTQ5ODYtOWIwZS1lZjY5YmNiMzY2MjMiLCJuYmYiOjE3Mzg4ODQ4NzMsInN1YiI6Im51bWJlcjo2Njk0IiwidHlwIjoiYWNjZXNzIn0.HQx-F-PySrQjKA9e5xB_1Hxj__Lmrd5zqK62p8I3DU73q3DFteQIX-l27J65yzlQYOw8Di5i0fPytb8UqdPulA";

export async function downloadMedia(
  mediaId: string | undefined, // Update parameter type
  folderName: string
): Promise<string> {
  if (!mediaId) {
    throw new Error("Media ID is required");
  }

  const mediaUrl = `${process.env.TURN_IO_API}/media/${mediaId}`;
  const mediaResponse = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${process.env.TURN_IO_TOKEN}` },
  });

  if (!mediaResponse.ok) {
    throw new Error(`Failed to download media: ${mediaResponse.statusText}`);
  }

  const folderPath = path.join(__dirname, "../../media", folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, mediaId);
  const fileStream = fs.createWriteStream(filePath);
  const mediaBlob = await mediaResponse.blob();
  const buffer = Buffer.from(await mediaBlob.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    fileStream.write(buffer, (error) => {
      if (error) reject(error);
      fileStream.end();
      resolve();
    });
  });

  return filePath;
}

export function cleanupMedia(...filePaths: string[]): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function isValidMediaId(
  mediaId: string | undefined,
  type: "images" | "audios"
): boolean {
  if (!mediaId) return false;
  if (mediaId.startsWith("@")) return false;

  const validExtensions = {
    images: [".jpg"],
    audios: [".ogg"],
  };

  return validExtensions[type].some((ext) => mediaId.endsWith(ext));
}
