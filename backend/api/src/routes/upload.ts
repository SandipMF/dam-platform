import { Router } from "express";
import multer from "multer";
import { assetQueue } from "../queue/assetQueue.ts";
import { Asset } from "../models/Asset.ts";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import { s3 } from "../config/s3-config.ts";
import { ENV } from "../constants/env.ts";

dotenv.config();

const router = Router();

if (!ENV.MINIO_BUCKET_NAME) {
  throw new Error("MINIO_BUCKET_NAME is required in .env");
}

const upload = multer({
  storage: multerS3({
    s3,
    bucket: ENV.MINIO_BUCKET_NAME,
    acl: "public-read",
    key: (_, file, cb) => {
      const fileName = Date.now() + "-" + file.originalname;
      cb(null, fileName);
    },
  }),
});

router.post("/", upload.array("files"), async (req, res) => {
  try {
    const files = req.files as Express.MulterS3.File[];

    const savedAssets = await Promise.all(
      files.map(async (file) => {
        const asset = new Asset({
          filename: file.originalname,
          type: file.mimetype.startsWith("image")
            ? "image"
            : file.mimetype.startsWith("video")
            ? "video"
            : "other",
          size: file.size,
          path: file.location,
          status: "pending",
          uploadedAt: new Date(),
        });

        const saved = await asset.save();
        
        // enqueue job for worker
        await assetQueue.add("process", {
          assetId: (saved._id as string).toString(),
          type: saved.type,
        });

        return saved;
      })
    );

    res.status(201).json(savedAssets);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
