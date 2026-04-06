#!/usr/bin/env node

/**
 * Script to register the Telegram webhook after Vercel deployment.
 *
 * Usage:
 *   BOT_TOKEN=your_token VERCEL_URL=your-app.vercel.app node scripts/setup-webhook.js
 *
 * Or after deploy, run once:
 *   node scripts/setup-webhook.js
 */

const BOT_TOKEN = process.env.BOT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;

if (!BOT_TOKEN) {
  console.error("❌ Missing BOT_TOKEN environment variable");
  process.exit(1);
}

if (!VERCEL_URL) {
  console.error("❌ Missing VERCEL_URL environment variable");
  console.error("   Set VERCEL_URL to your Vercel deployment URL, e.g.:");
  console.error("   VERCEL_URL=your-app.vercel.app node scripts/setup-webhook.js");
  process.exit(1);
}

const webhookUrl = `https://${VERCEL_URL.replace(/^https?:\/\//, "")}/api/bot/webhook`;

async function setupWebhook() {
  console.log(`🔗 Setting webhook to: ${webhookUrl}`);

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      }),
    }
  );

  const data = await response.json();

  if (data.ok) {
    console.log("✅ Webhook registered successfully!");
    console.log(`   URL: ${webhookUrl}`);
  } else {
    console.error("❌ Failed to register webhook:", data.description);
    process.exit(1);
  }

  const infoRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
  );
  const info = await infoRes.json();
  console.log("\n📋 Webhook Info:");
  console.log(JSON.stringify(info.result, null, 2));
}

setupWebhook().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
