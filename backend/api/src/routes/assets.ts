import { Router } from "express";
import { Asset } from "../models/Asset.js";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

// Get all assets
router.get("/", async (req, res) => {
  try {
    const assets = await Asset.find().sort({ uploadedAt: -1 });
    res.json(assets);
  } catch (err) {
    console.error("Failed to fetch assets:", err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// New route: stream thumbnail/file by asset id
router.get("/:id/thumbnail", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const bucket = process.env.MINIO_BUCKET_NAME || "mybucket";
    const key = decodeURIComponent(asset.path.split("/").pop()!); // extract file name

    console.log("Fetching file from MinIO:", { bucket, key });

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const data = await s3.send(command);

    res.setHeader("Content-Type", asset.type || "application/octet-stream");

    // Stream file to client
    (data.Body as any).pipe(res);
  } catch (err: any) {
    console.error("Error streaming file:", err);

    // Log AWS/MinIO error details if available
    if (err.$metadata) {
      console.error("AWS Metadata:", err.$metadata);
    }

    if (err.Code) {
      console.error("AWS Error Code:", err.Code);
      console.error("AWS Error Message:", err.Message);
    }

    res.status(500).json({
      error: "Could not fetch file",
      details: err.message,
    });
  }
});

// Download file by asset id
router.get("/:id/download", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    // Increment downloads
    asset.downloads = (asset.downloads || 0) + 1;
    await asset.save();

    const bucket = process.env.MINIO_BUCKET_NAME || "mybucket";
    const key = decodeURIComponent(asset.path.split("/").pop()!);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const data = await s3.send(command);

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asset.filename}"`
    );
    res.setHeader("Content-Type", asset.type || "application/octet-stream");

    // Stream file to client
    (data.Body as any).pipe(res);
  } catch (err) {
    console.error("Error downloading file:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Download failed", details: errorMessage });
  }
});

// Preview file by asset id (for images/videos)
router.get("/:id/preview", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const bucket = process.env.MINIO_BUCKET_NAME || "mybucket";
    const key = decodeURIComponent(asset.path.split("/").pop()!);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const data = await s3.send(command);

    // Handle video streaming (Range requests)
    if (asset.type && asset.type.startsWith("video")) {
      const range = req.headers.range;
      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : undefined;

        res.status(206); // Partial Content
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Type", asset.type);
        // We can’t easily get content length from stream, so omit Content-Length for now
      } else {
        res.setHeader("Content-Type", asset.type);
      }
    } else if (
      asset.type?.includes("pdf") ||
      asset.type?.includes("msword") ||
      asset.type?.includes("officedocument")
    ) {
      // For PDF/Word/etc → inline preview
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${asset.filename}"`
      );
      res.setHeader("Content-Type", asset.type);
    } else {
      // Default for images/others
      res.setHeader("Content-Type", asset.type || "application/octet-stream");
    }

    (data.Body as any).pipe(res);
  } catch (err) {
    console.error("Error previewing file:", err);
    res.status(500).json({ error: "Could not preview file" });
  }
});

//
router.get("/stats", async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const totalDownloadsAgg = await Asset.aggregate([
      { $group: { _id: null, total: { $sum: "$downloads" } } },
    ]);
    const totalDownloads = totalDownloadsAgg[0]?.total || 0;
    const latestAssets = await Asset.find().sort({ createdAt: -1 }).limit(5);

    res.json({ totalAssets, totalDownloads, latestAssets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
export default router;
