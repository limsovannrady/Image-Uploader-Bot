export const BOT_TOKEN = process.env.BOT_TOKEN!;
export const IMGBB_UPLOAD_URL = "https://api-integretion-unblocked.vercel.app/imgbb";
export const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME!;
export const DEVELOPER_ID = 7855536617;
export const WELCOME_IMAGE_URL = "https://i.imghippo.com/files/GdN9496KmY.jpg";

if (!BOT_TOKEN) throw new Error("Missing required environment variable: BOT_TOKEN");
if (!CHANNEL_USERNAME) throw new Error("Missing required environment variable: CHANNEL_USERNAME");
if (!CHANNEL_USERNAME.startsWith("@")) throw new Error('Invalid CHANNEL_USERNAME: it must start with "@"');

export const CLEAN_USERNAME = CHANNEL_USERNAME.replace(/@/g, "");
export const USE_DB = false;
