import { Router } from "express";
import { db, uploadsTable } from "@workspace/db";
import { count, eq, desc } from "drizzle-orm";

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

export default dashboardRouter;
