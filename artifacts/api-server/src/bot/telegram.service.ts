import { BOT_TOKEN } from "./config";
import { logger } from "../lib/logger";

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const TelegramService = {
  async sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}): Promise<void> {
    const res = await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      logger.error({ chatId, error: data.description }, "sendMessage failed");
    }
  },

  async sendPhoto(chatId: number, photo: string, caption: string, replyMarkup?: unknown): Promise<void> {
    const res = await fetch(`${API_URL}/sendPhoto`, {
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
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      logger.error({ chatId, photo, error: data.description }, "sendPhoto failed");
      await fetch(`${API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: "HTML", reply_markup: replyMarkup }),
      });
    }
  },

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`${API_URL}/getFile?file_id=${fileId}`);
    const data = await response.json() as { ok: boolean; result?: { file_path?: string }; description?: string };
    if (!data.ok) {
      logger.error({ fileId, error: data.description }, "getFile failed");
      return "";
    }
    return data.result?.file_path
      ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`
      : "";
  },
};
