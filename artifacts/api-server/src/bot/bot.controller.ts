import { TelegramService } from "./telegram.service";
import { FileUploadService } from "./image-upload.service";
import { SubscriptionService } from "./subscription.service";
import { USE_DB, WELCOME_IMAGE_URL, DEVELOPER_USERNAME, CLEAN_USERNAME } from "./config";
import { logger } from "../lib/logger";
import { db, uploadsTable } from "@workspace/db";

interface PhotoSize { file_id: string; width: number; height: number; }
interface Document { file_id: string; mime_type?: string; file_name?: string; }
interface Video { file_id: string; mime_type?: string; }
interface Animation { file_id: string; mime_type?: string; }
interface Update {
  message?: {
    message_id: number;
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

    const { message_id, chat, from, text, photo, document, video, animation } = update.message;
    const chatId = chat.id;
    const userId = from.id;
    const replyTo = message_id;

    logger.info({ chatId, userId, text, hasPhoto: !!photo, hasDocument: !!document, hasVideo: !!video }, "Processing message");

    if (text === "/start") {
      logger.info({ chatId }, "Handling /start");
      await TelegramService.sendChatAction(chatId, "typing");
      await TelegramService.sendPhoto(
        chatId,
        WELCOME_IMAGE_URL,
        `<b>🖍️ សូមស្វាគមន៍មកកាន់ Media Link Bot!</b>\n\n` +
        `<i>ផ្ញើរូបភាព ឬវីដេអូ ដើម្បីទទួលបានលីងដែលអាចចែករំលែកបាន</i>`,
        {
          inline_keyboard: [
            [{ text: "Developer 🎾", url: `https://t.me/${DEVELOPER_USERNAME}` }],
            [{ text: "Join Channel 📢", url: `https://t.me/${CLEAN_USERNAME}` }],
          ],
        },
        replyTo
      );
      return;
    }

    if (text === "/users") {
      await TelegramService.sendChatAction(chatId, "typing");
      const responseText = USE_DB
        ? "📊 មុខងារមូលដ្ឋានទិន្នន័យមិនទាន់ត្រូវបានបើក"
        : "📊 មូលដ្ឋានទិន្នន័យមិនទាន់ត្រូវបានកំណត់";
      await TelegramService.sendMessage(chatId, responseText, { reply_to_message_id: replyTo });
      return;
    }

    const isImage = photo || document?.mime_type?.startsWith("image/");
    const isVideo = video || animation || document?.mime_type?.startsWith("video/");

    if (isImage || isVideo) {
      await TelegramService.sendChatAction(chatId, "typing");

      logger.info({ chatId, userId }, "Checking subscription");
      const hasAccess = await SubscriptionService.checkSubscription(userId);
      logger.info({ chatId, userId, hasAccess }, "Subscription check result");

      if (!hasAccess) {
        await TelegramService.sendMessage(
          chatId,
          `<b>🔒 មុខងារ Premium</b>\n\n` +
          `សូមចូលរួមបណ្តាញរបស់យើង ដើម្បីដោះសោមុខងារនេះ!\n\n` +
          `<a href="https://t.me/${CLEAN_USERNAME}">👉 ចុចទីនេះដើម្បីចូលរួម</a>`,
          { disable_web_page_preview: true, reply_to_message_id: replyTo }
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

      await TelegramService.sendChatAction(chatId, isVideo ? "upload_video" : "upload_photo");

      logger.info({ fileId, mimeType }, "Fetching file URL");
      const fileUrl = await TelegramService.getFileUrl(fileId);
      if (!fileUrl) {
        await TelegramService.sendMessage(chatId, "❌ ឯកសារធំពេក (អតិបរមា 20MB)", { reply_to_message_id: replyTo });
        return;
      }

      logger.info({ fileUrl }, "Got file URL, downloading");
      const fileResponse = await fetch(fileUrl);
      const fileBuffer = await fileResponse.arrayBuffer();

      const label = isVideo ? "video" : "image";
      logger.info(`Uploading ${label} to catbox.moe`);
      const fileLink = await FileUploadService.uploadFile(fileBuffer, mimeType);
      logger.info({ fileLink }, "Upload result");

      if (fileLink) {
        try {
          await db.insert(uploadsTable).values({ fileUrl: fileLink, fileType: label, userId });
        } catch (err) {
          logger.error(err, "Failed to save upload to DB");
        }
      }

      await TelegramService.sendMessage(
        chatId,
        fileLink
          ? `✅ ការផ្ទុកឡើងបានជោគជ័យ!\n\n🔗 ${fileLink}`
          : `❌ ការផ្ទុកឡើង${label === "video" ? "វីដេអូ" : "រូបភាព"}បរាជ័យ`,
        fileLink
          ? {
              reply_to_message_id: replyTo,
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Share Link 🔗", url: `tg://msg_url?url=${encodeURIComponent(fileLink)}` }],
                ],
              },
            }
          : { reply_to_message_id: replyTo }
      );
      return;
    }

    if (document) {
      await TelegramService.sendChatAction(chatId, "typing");
      await TelegramService.sendMessage(
        chatId,
        "❌ ប្រភេទឯកសារមិនត្រូវបានគាំទ្រ។ សូមផ្ញើឯកសាររូបភាព ឬវីដេអូ។",
        { reply_to_message_id: replyTo }
      );
      return;
    }

    await TelegramService.sendChatAction(chatId, "typing");
    await TelegramService.sendMessage(
      chatId,
      "📸 ផ្ញើរូបភាព ឬវីដេអូ ដើម្បីចាប់ផ្តើម!\n\n" +
      "✨ មុខងារ:\n" +
      "- បំប្លែងរូបភាព និងវីដេអូទៅជាលីងផ្ទាល់\n" +
      "- លីងដែលអាចចែករំលែកបាន\n" +
      "- ត្រូវការជាសមាជិកបណ្តាញ",
      { reply_to_message_id: replyTo }
    );
  },
};
