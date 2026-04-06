import { logger } from "../lib/logger";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/webm": "webm",
  "video/mpeg": "mpeg",
};

export const FileUploadService = {
  async uploadFile(fileBuffer: ArrayBuffer, mimeType: string): Promise<string> {
    try {
      const ext = MIME_TO_EXT[mimeType] || "bin";
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("userhash", "");
      const blob = new Blob([fileBuffer], { type: mimeType });
      form.append("fileToUpload", blob, `file.${ext}`);

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form,
      });

      const text = await response.text();
      logger.info({ result: text, mimeType }, "File upload result");

      if (text.startsWith("https://")) {
        return text.trim();
      }

      logger.error({ result: text }, "File upload failed");
      return "";
    } catch (err) {
      logger.error(err, "File upload error");
      return "";
    }
  },

  async uploadImage(imageBuffer: ArrayBuffer): Promise<string> {
    return this.uploadFile(imageBuffer, "image/jpeg");
  },
};
