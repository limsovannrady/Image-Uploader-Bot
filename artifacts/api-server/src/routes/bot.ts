import { Router } from "express";
import { BotController } from "../bot/bot.controller";
import { logger } from "../lib/logger";

const botRouter = Router();

botRouter.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const update = req.body;
  logger.info({ update }, "Received Telegram update");
  try {
    await BotController.handleUpdate(update);
  } catch (err) {
    logger.error(err, "Bot update handler error");
  }
});

export default botRouter;
