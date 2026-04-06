import { Router } from "express";
import { db, uploadsTable } from "@workspace/db";
import { count, eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { FileUploadService } from "../bot/image-upload.service";

const dashboardRouter = Router();

const DEFAULT_STATS = {
  totalUploads: 0,
  imageCount: 0,
  videoCount: 0,
  totalUsers: 0,
  botStatus: "online" as const,
};

dashboardRouter.get("/stats", async (_req, res) => {
  try {
    const [totalResult] = await db.select({ count: count() }).from(uploadsTable);
    const [imageResult] = await db.select({ count: count() }).from(uploadsTable).where(eq(uploadsTable.fileType, "image"));
    const [videoResult] = await db.select({ count: count() }).from(uploadsTable).where(eq(uploadsTable.fileType, "video"));
    const userResult = await db.selectDistinct({ userId: uploadsTable.userId }).from(uploadsTable);
    res.json({
      totalUploads: totalResult.count,
      imageCount: imageResult.count,
      videoCount: videoResult.count,
      totalUsers: userResult.length,
      botStatus: "online",
    });
  } catch {
    res.json(DEFAULT_STATS);
  }
});

dashboardRouter.get("/recent", async (_req, res) => {
  try {
    const uploads = await db.select().from(uploadsTable).orderBy(desc(uploadsTable.createdAt)).limit(20);
    res.json(uploads);
  } catch {
    res.json([]);
  }
});

dashboardRouter.post("/upload", async (req, res) => {
  try {
    const { base64, mimeType } = req.body as { base64?: string; mimeType?: string };
    if (!base64 || !mimeType) {
      res.status(400).json({ error: "base64 and mimeType are required" });
      return;
    }

    const buffer = Buffer.from(base64, "base64");
    const fileUrl = await FileUploadService.uploadFile(buffer.buffer as ArrayBuffer, mimeType);

    if (!fileUrl) {
      res.status(500).json({ error: "Upload failed" });
      return;
    }

    try {
      const fileType = mimeType.startsWith("video/") ? "video" : "image";
      await db.insert(uploadsTable).values({ fileUrl, fileType, userId: 0 });
    } catch (err) {
      logger.error(err, "Failed to save upload to DB (continuing)");
    }

    res.json({ url: fileUrl });
  } catch (err) {
    logger.error(err, "Upload error");
    res.status(500).json({ error: "Upload failed" });
  }
});

export default dashboardRouter;
