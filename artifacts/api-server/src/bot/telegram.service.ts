import { BOT_TOKEN } from "./config";
import { logger } from "../lib/logger";

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegramPost(method: string, body: Record<string, unknown>): Promise<{ ok: boolean; description?: string; result?: unknown }> {
  const res = await fetch(`${API_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<{ ok: boolean; description?: string; result?: unknown }>;
}

export const TelegramService = {
  async sendChatAction(chatId: number, action: string = "typing"): Promise<void> {
    try {
      await telegramPost("sendChatAction", { chat_id: chatId, action });
    } catch (err) {
      logger.warn({ chatId, action, err }, "sendChatAction failed (ignored)");
    }
  },

  async sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}): Promise<void> {
    try {
      const data = await telegramPost("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...extra,
      });

      if (!data.ok) {
        const isReplyError = data.description?.includes("message to be replied not found") ||
          data.description?.includes("reply message not found");

        if (isReplyError && extra.reply_to_message_id) {
          logger.warn({ chatId }, "Reply message not found, retrying without reply");
          const { reply_to_message_id: _, ...extraWithoutReply } = extra;
          const retryData = await telegramPost("sendMessage", {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            ...extraWithoutReply,
          });
          if (!retryData.ok) {
            logger.error({ chatId, error: retryData.description }, "sendMessage retry also failed");
          } else {
            logger.info({ chatId }, "sendMessage success (without reply)");
          }
        } else {
          logger.error({ chatId, error: data.description }, "sendMessage failed");
        }
      } else {
        logger.info({ chatId }, "sendMessage success");
      }
    } catch (err) {
      logger.error({ chatId, err }, "sendMessage network error");
    }
  },

  async sendPhoto(chatId: number, photo: string, caption: string, replyMarkup?: unknown, replyToMessageId?: number): Promise<void> {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    };
    if (replyToMessageId) body.reply_to_message_id = replyToMessageId;

    try {
      logger.info({ chatId, photo }, "sendPhoto attempt");
      const data = await telegramPost("sendPhoto", body);

      if (!data.ok) {
        logger.warn({ chatId, error: data.description }, "sendPhoto failed, falling back to sendMessage");
        await this.sendMessage(chatId, caption, {
          reply_markup: replyMarkup,
          ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
        });
      } else {
        logger.info({ chatId }, "sendPhoto success");
      }
    } catch (err) {
      logger.error({ chatId, err }, "sendPhoto network error, falling back to sendMessage");
      await this.sendMessage(chatId, caption, { reply_markup: replyMarkup });
    }
  },

  async getFileUrl(fileId: string): Promise<string> {
    try {
      const data = await telegramPost("getFile", { file_id: fileId }) as { ok: boolean; result?: { file_path?: string }; description?: string };
      if (!data.ok) {
        logger.error({ fileId, error: (data as { description?: string }).description }, "getFile failed");
        return "";
      }
      const result = data.result as { file_path?: string } | undefined;
      return result?.file_path
        ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${result.file_path}`
        : "";
    } catch (err) {
      logger.error({ fileId, err }, "getFile network error");
      return "";
    }
  },
};
