import { BOT_TOKEN } from "./config";
import { logger } from "../lib/logger";

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const TelegramService = {
  async sendChatAction(chatId: number, action: string = "typing"): Promise<void> {
    try {
      await fetch(`${API_URL}/sendChatAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, action }),
      });
    } catch (err) {
      logger.error({ chatId, action, err }, "sendChatAction network error");
    }
  },

  async sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
      });
      const data = await res.json() as { ok: boolean; description?: string };
      if (!data.ok) {
        logger.error({ chatId, error: data.description }, "sendMessage failed");
      } else {
        logger.info({ chatId }, "sendMessage success");
      }
    } catch (err) {
      logger.error({ chatId, err }, "sendMessage network error");
    }
  },

  async sendPhoto(chatId: number, photo: string, caption: string, replyMarkup?: unknown, replyToMessageId?: number): Promise<void> {
    try {
      const body: Record<string, unknown> = {
        chat_id: chatId,
        photo,
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      };
      if (replyToMessageId) body.reply_to_message_id = replyToMessageId;

      logger.info({ chatId, photo }, "sendPhoto attempt");
      const res = await fetch(`${API_URL}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { ok: boolean; description?: string };
      if (!data.ok) {
        logger.warn({ chatId, photo, error: data.description }, "sendPhoto failed, falling back to sendMessage");
        await this.sendMessage(chatId, caption, { reply_markup: replyMarkup, reply_to_message_id: replyToMessageId });
      } else {
        logger.info({ chatId }, "sendPhoto success");
      }
    } catch (err) {
      logger.error({ chatId, err }, "sendPhoto network error, falling back to sendMessage");
      try {
        await this.sendMessage(chatId, caption, { reply_markup: replyMarkup, reply_to_message_id: replyToMessageId });
      } catch (err2) {
        logger.error({ chatId, err2 }, "sendMessage fallback also failed");
      }
    }
  },

  async getFileUrl(fileId: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/getFile?file_id=${fileId}`);
      const data = await response.json() as { ok: boolean; result?: { file_path?: string }; description?: string };
      if (!data.ok) {
        logger.error({ fileId, error: data.description }, "getFile failed");
        return "";
      }
      return data.result?.file_path
        ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`
        : "";
    } catch (err) {
      logger.error({ fileId, err }, "getFile network error");
      return "";
    }
  },
};
