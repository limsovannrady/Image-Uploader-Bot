# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Telegram Media-to-Link Bot with Express API and React Dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (optional, USE_DB=false by default)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM for dev, CJS for Vercel)
- **Telegram**: Webhook-based bot (ready for serverless)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Vercel Deployment

See `DEPLOY.md` for full deployment instructions.

- `vercel.json` at root configures the deployment
- `api/index.js` — Vercel serverless entry point
- `api/vercel.cjs` — built automatically during `pnpm --filter @workspace/api-server build`
- Bot uses webhooks: Telegram sends updates to `/api/bot/webhook`
- After deploy, run: `node scripts/setup-webhook.js`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | Yes | Telegram Bot Token |
| `CHANNEL_USERNAME` | Yes | `@ChannelName` for subscription check |
| `DEVELOPER_USERNAME` | No | Telegram username for developer button |
| `DATABASE_URL` | No | PostgreSQL URL for tracking uploads |

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
