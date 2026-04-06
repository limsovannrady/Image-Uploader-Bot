import { Router } from "express";
import { BotController } from "../bot/bot.controller";
import { logger } from "../lib/logger";

const botRouter = Router();

botRouter.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    await BotController.handleUpdate(req.body);
  } catch (err) {
    logger.error(err, "Bot update handler error");
  }
});

export default botRouter;
