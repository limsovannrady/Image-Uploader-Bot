# Deploy to Vercel (Bot 24/7 Lifetime)

## របៀប Deploy

### 1. Push ទៅ GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. Connect ទៅ Vercel
1. ចូល [vercel.com](https://vercel.com) → **New Project**
2. Import repository GitHub របស់អ្នក
3. Framework: **Other**
4. Root Directory: `.` (root)
5. Vercel នឹង detect `vercel.json` ដោយស្វ័យប្រវត្តិ

### 3. Set Environment Variables ក្នុង Vercel Dashboard
| Variable | Value |
|----------|-------|
| `BOT_TOKEN` | Telegram Bot Token (ពី @BotFather) |
| `CHANNEL_USERNAME` | `@YourChannelName` |
| `DEVELOPER_USERNAME` | username Telegram របស់អ្នក |
| `DATABASE_URL` | PostgreSQL URL (ស្រេចចិត្ត — ប្រសិនបើមាន) |

### 4. Deploy
Click **Deploy** — Vercel នឹង:
- Run `pnpm install`
- Build API server (bundle Express + Bot)
- Build Dashboard (static React)
- Deploy ជា serverless functions

### 5. Register Webhook (សំខាន់ណាស់!)
ក្រោយ deploy ហើយ ត្រូវ register webhook ម្តង:

```bash
BOT_TOKEN=your_token VERCEL_URL=your-app.vercel.app node scripts/setup-webhook.js
```

**ឬ** ចូល browser:
```
https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=https://your-app.vercel.app/api/bot/webhook
```

## Architecture

```
User → Telegram → Webhook → Vercel Function → Bot Logic → Catbox.moe
                                    ↓
                              Dashboard (Static)
```

## URLs ក្រោយ Deploy
- Dashboard: `https://your-app.vercel.app/`
- Bot Webhook: `https://your-app.vercel.app/api/bot/webhook`
- Health Check: `https://your-app.vercel.app/api/healthz`

## ហេតុអ្វី Bot ដំណើរការ 24/7?
- Vercel serverless function ត្រូវបាន trigger ដោយ Telegram webhook
- មិនចាំបាច់ server ដំណើរការជាប់រហូត
- Bot ឆ្លើយតបរាល់ message ថ្មី ដោយស្វ័យប្រវត្តិ
- Free tier Vercel — **ដំណើរការ lifetime ដោយឥតគិតថ្លៃ**
