import { TelegramService } from "./telegram.service";
import { ImageUploadService } from "./image-upload.service";
import { SubscriptionService } from "./subscription.service";
import { USE_DB, WELCOME_IMAGE_URL, DEVELOPER_ID, CLEAN_USERNAME } from "./config";

interface PhotoSize { file_id: string; width: number; height: number; }
interface Document { file_id: string; mime_type?: string; }
interface Update {
  message?: {
    chat: { id: number };
    from: { id: number };
    text?: string;
    photo?: PhotoSize[];
    document?: Document;
  };
}

export const BotController = {
  async handleUpdate(update: Update): Promise<void> {
    if (!update.message) return;

    const { chat, from, text, photo, document } = update.message;
    const chatId = chat.id;
    const userId = from.id;

    if (text === "/start") {
      await TelegramService.sendPhoto(
        chatId,
        WELCOME_IMAGE_URL,
        `<b>🖍️ Welcome to Image Link Bot!</b>\n\n` +
        `<i>Send me an image (as photo or file) to get a shareable link</i>`,
        {
          inline_keyboard: [
            [{ text: "Developer 🎾", url: `tg://user?id=${DEVELOPER_ID}` }],
            [{ text: "Join Channel 📢", url: `https://t.me/${CLEAN_USERNAME}` }],
            [{ text: "Source Code ↗️", url: `https://github.com/Private-Bots-Official/Image-Uploader-Bot` }],
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

    if (photo || document?.mime_type?.startsWith("image/")) {
      const hasAccess = await SubscriptionService.checkSubscription(userId);
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
      if (photo) {
        fileId = photo[photo.length - 1].file_id;
      } else {
        fileId = document!.file_id;
      }

      const fileUrl = await TelegramService.getFileUrl(fileId);
      const fileResponse = await fetch(fileUrl);
      const imageBuffer = await fileResponse.arrayBuffer();
      const imageUrl = await ImageUploadService.uploadImage(imageBuffer);

      await TelegramService.sendMessage(
        chatId,
        imageUrl || "❌ Failed to upload image",
        imageUrl
          ? {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Share Link 🔗", url: `tg://msg_url?url=${encodeURIComponent(imageUrl)}` }],
                  [{ text: "Source Code ↗️", url: `https://github.com/Private-Bots-Official/Image-Uploader-Bot` }],
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
        "❌ Unsupported file type. Please send an image file (JPEG, PNG, etc.)"
      );
      return;
    }

    await TelegramService.sendMessage(
      chatId,
      "📸 Send me an image (as photo or file) to get started!\n\n" +
      "✨ Features:\n" +
      "- Convert images to direct links\n" +
      "- Shareable links\n" +
      "- Channel membership required"
    );
  },
};
