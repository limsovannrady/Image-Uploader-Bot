import { Router } from "express";
import { db, uploadsTable } from "@workspace/db";
import { count, eq, desc } from "drizzle-orm";
import { FileUploadService } from "../bot/image-upload.service";

const dashboardRouter = Router();

dashboardRouter.get("/stats", async (req, res) => {
  try {
    const [totalResult] = await db.select({ count: count() }).from(uploadsTable);
    const [imageResult] = await db.select({ count: count() }).from(uploadsTable).where(eq(uploadsTable.fileType, "image"));
    const [videoResult] = await db.select({ count: count() }).from(uploadsTable).where(eq(uploadsTable.fileType, "video"));

    const userResult = await db
      .selectDistinct({ userId: uploadsTable.userId })
      .from(uploadsTable);

    res.json({
      totalUploads: totalResult.count,
      imageCount: imageResult.count,
      videoCount: videoResult.count,
      totalUsers: userResult.length,
      botStatus: "online",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

dashboardRouter.get("/recent", async (req, res) => {
  try {
    const uploads = await db
      .select()
      .from(uploadsTable)
      .orderBy(desc(uploadsTable.createdAt))
      .limit(20);
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent uploads" });
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

    const fileType = mimeType.startsWith("video/") ? "video" : "image";
    await db.insert(uploadsTable).values({ fileUrl, fileType, userId: 0 });

    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default dashboardRouter;
