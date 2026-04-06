import { logger } from "../lib/logger";

export const ImageUploadService = {
  async uploadImage(imageBuffer: ArrayBuffer): Promise<string> {
    try {
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("userhash", "");
      const blob = new Blob([imageBuffer], { type: "image/jpeg" });
      form.append("fileToUpload", blob, "image.jpg");

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form,
      });

      const text = await response.text();
      logger.info({ result: text }, "Image upload result");

      if (text.startsWith("https://")) {
        return text.trim();
      }

      logger.error({ result: text }, "Image upload failed");
      return "";
    } catch (err) {
      logger.error(err, "Image upload error");
      return "";
    }
  },
};
