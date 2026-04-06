import { TelegramService } from "./telegram.service";
import { FileUploadService } from "./image-upload.service";
import { SubscriptionService } from "./subscription.service";
import { USE_DB, WELCOME_IMAGE_URL, DEVELOPER_USERNAME, CLEAN_USERNAME } from "./config";
import { logger } from "../lib/logger";

interface PhotoSize { file_id: string; width: number; height: number; }
interface Document { file_id: string; mime_type?: string; file_name?: string; }
interface Video { file_id: string; mime_type?: string; }
interface Animation { file_id: string; mime_type?: string; }
interface Update {
  message?: {
    chat: { id: number };
    from: { id: number };
    text?: string;
    photo?: PhotoSize[];
    document?: Document;
    video?: Video;
    animation?: Animation;
  };
}

export const BotController = {
  async handleUpdate(update: Update): Promise<void> {
    if (!update.message) {
      logger.info("Update has no message, skipping");
      return;
    }

    const { chat, from, text, photo, document, video, animation } = update.message;
    const chatId = chat.id;
    const userId = from.id;

    logger.info({ chatId, userId, text, hasPhoto: !!photo, hasDocument: !!document, hasVideo: !!video }, "Processing message");

    if (text === "/start") {
      logger.info({ chatId }, "Handling /start");
      await TelegramService.sendPhoto(
        chatId,
        WELCOME_IMAGE_URL,
        `<b>🖍️ Welcome to Media Link Bot!</b>\n\n` +
        `<i>Send me an image or video to get a shareable link</i>`,
        {
          inline_keyboard: [
            [{ text: "Developer 🎾", url: `https://t.me/${DEVELOPER_USERNAME}` }],
            [{ text: "Join Channel 📢", url: `https://t.me/${CLEAN_USERNAME}` }],
          ],
        }
      );
      return;
    }

    if (text === "/users") {
      const responseText = USE_DB
        ? "Database feature not enabled"
        : "📊 Database not configured";
      await TelegramService.sendMessage(chatId, responseText);
      return;
    }

    const isImage = photo || document?.mime_type?.startsWith("image/");
    const isVideo = video || animation || document?.mime_type?.startsWith("video/");

    if (isImage || isVideo) {
      logger.info({ chatId, userId }, "Checking subscription");
      const hasAccess = await SubscriptionService.checkSubscription(userId);
      logger.info({ chatId, userId, hasAccess }, "Subscription check result");

      if (!hasAccess) {
        await TelegramService.sendMessage(
          chatId,
          `<b>🔒 Premium Feature</b>\n\n` +
          `Join our channel to unlock this feature!\n\n` +
          `<a href="https://t.me/${CLEAN_USERNAME}">👉 Click here to join</a>`,
          { disable_web_page_preview: true }
        );
        return;
      }

      let fileId: string;
      let mimeType: string;

      if (photo) {
        fileId = photo[photo.length - 1].file_id;
        mimeType = "image/jpeg";
      } else if (video) {
        fileId = video.file_id;
        mimeType = video.mime_type || "video/mp4";
      } else if (animation) {
        fileId = animation.file_id;
        mimeType = animation.mime_type || "video/mp4";
      } else {
        fileId = document!.file_id;
        mimeType = document!.mime_type || "application/octet-stream";
      }

      logger.info({ fileId, mimeType }, "Fetching file URL");
      const fileUrl = await TelegramService.getFileUrl(fileId);
      if (!fileUrl) {
        await TelegramService.sendMessage(chatId, "❌ File too large to process (max 20MB)");
        return;
      }

      logger.info({ fileUrl }, "Got file URL, downloading");
      const fileResponse = await fetch(fileUrl);
      const fileBuffer = await fileResponse.arrayBuffer();

      const label = isVideo ? "video" : "image";
      logger.info(`Uploading ${label} to catbox.moe`);
      const fileLink = await FileUploadService.uploadFile(fileBuffer, mimeType);
      logger.info({ fileLink }, "Upload result");

      await TelegramService.sendMessage(
        chatId,
        fileLink || `❌ Failed to upload ${label}`,
        fileLink
          ? {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Share Link 🔗", url: `tg://msg_url?url=${encodeURIComponent(fileLink)}` }],
                ],
              },
            }
          : {}
      );
      return;
    }

    if (document) {
      await TelegramService.sendMessage(
        chatId,
        "❌ Unsupported file type. Please send an image or video file."
      );
      return;
    }

    await TelegramService.sendMessage(
      chatId,
      "📸 Send me an image or video to get started!\n\n" +
      "✨ Features:\n" +
      "- Convert images & videos to direct links\n" +
      "- Shareable links\n" +
      "- Channel membership required"
    );
  },
};
