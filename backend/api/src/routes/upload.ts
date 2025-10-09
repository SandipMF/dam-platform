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

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: ENV.MINIO_BUCKET_NAME,
//     acl: "public-read",
//     key: (_, file, cb) => {
//       const fileName = Date.now() + "-" + file.originalname;
//       cb(null, fileName);
//     },
//   }),
// });

/**
 * STEP 1: Define multerS3 storage
 * - We’ll temporarily store uploaded files into /tmp first
 * - After creating Asset IDs, we’ll upload to MinIO under each assetId folder
 */
const upload = multer({ storage: multer.memoryStorage() }); // store in memory first

router.post("/", upload.array("files"), async (req, res) => {
  try {
    const files = req.files as Express.MulterS3.File[];

    // STEP 2: Pre-create all asset entries before uploading
    const assetDocs = await Promise.all(
      files.map(async (file) => {
        const asset = new Asset({
          filename: file.originalname,
          type: file.mimetype.startsWith("image")
            ? "image"
            : file.mimetype.startsWith("video")
            ? "video"
            : "other",
          size: file.size,
          path: "", //file.location,
          status: "pending",
          uploadedAt: new Date(),
        });

        const saved = await asset.save();

        // enqueue job for worker
        // await assetQueue.add("process", {
        //   assetId: (saved._id as string).toString(),
        //   type: saved.type,
        // });

        return saved;
      })
    );

    // STEP 3: Upload each file to MinIO inside its own assetId folder
    const uploadedAssets = await Promise.all(
      assetDocs.map(async (asset, index) => {
        const file = files[index];
        const fileName = `${Date.now()}-${file.originalname}`;
        const key = `${asset._id}/${fileName}`; // ✅ create folder using assetId

        // Upload to MinIO
        const { PutObjectCommand } = await import("@aws-sdk/client-s3");
        const uploadCmd = new PutObjectCommand({
          Bucket: ENV.MINIO_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        });
        await s3.send(uploadCmd);

        // Construct public URL
        const fileUrl = `${ENV.MINIO_ENDPOINT}/${ENV.MINIO_BUCKET_NAME}/${key}`;

        // STEP 4: Update asset in DB
        asset.path = fileUrl;
        asset.status = "pending";
        asset.updatedAt = new Date();
        await asset.save();

        // STEP 5: Enqueue worker job
        await assetQueue.add("process", {
          assetId: (asset._id as string).toString(),
          type: asset.type,
        });

        return asset;
      })
    );

    res.status(201).json(uploadedAssets);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
