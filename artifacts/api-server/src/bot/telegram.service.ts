import { BOT_TOKEN } from "./config";

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const TelegramService = {
  async sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}): Promise<void> {
    await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
    });
  },

  async sendPhoto(chatId: number, photo: string, caption: string, replyMarkup?: unknown): Promise<void> {
    await fetch(`${API_URL}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });
  },

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`${API_URL}/getFile?file_id=${fileId}`);
    const data = await response.json() as { result?: { file_path?: string } };
    return data.result?.file_path
      ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`
      : "";
  },
};
