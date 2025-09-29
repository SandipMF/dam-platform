import { Router } from "express";
import multer from "multer";
import { assetQueue } from "../queue/assetQueue.js";
import { Asset } from "../models/Asset.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
/*
// store uploads locally for now (later -> MinIO/S3)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
*/
// --- Environment variables with defaults ---
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "minioadmin";
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME ?? "mybucket";

if (!MINIO_BUCKET_NAME) {
  throw new Error("MINIO_BUCKET_NAME is required in .env");
}

const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: MINIO_BUCKET_NAME,
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
