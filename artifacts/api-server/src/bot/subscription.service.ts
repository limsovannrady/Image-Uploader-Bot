import { BOT_TOKEN, CHANNEL_USERNAME } from "./config";

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const SubscriptionService = {
  async checkSubscription(userId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_URL}/getChatMember?chat_id=${encodeURIComponent(CHANNEL_USERNAME)}&user_id=${userId}`
      );
      const data = await response.json() as { result?: { status?: string } };
      const status = data.result?.status;
      return ["member", "administrator", "creator"].includes(status ?? "");
    } catch {
      return false;
    }
  },
};
