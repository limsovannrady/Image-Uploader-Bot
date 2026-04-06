import { IMGBB_UPLOAD_URL } from "./config";

export const ImageUploadService = {
  async uploadImage(imageBuffer: ArrayBuffer): Promise<string> {
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const formData = new URLSearchParams();
    formData.append("image", base64);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json() as { data?: { url?: string }; success?: boolean };
    if (data.success && data.data?.url) {
      return data.data.url;
    }
    return "";
  },
};
