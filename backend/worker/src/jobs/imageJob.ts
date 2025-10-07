import sharp from "sharp";
import path from "path";
import Asset from "../api-types/AssetModel.ts";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";

// --- Environment variables with defaults ---
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "minioadmin";
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME ?? "mybucket";

// Initialize S3 client for MinIO
const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// Helper: download file from MinIO to local temp path
async function downloadFromS3(bucket: string, key: string, outputPath: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const { Body } = await s3.send(command);

  const stream = Body as Readable;

  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(outputPath);
    stream.pipe(writeStream);
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  console.log("File downloaded:", outputPath);
}

export async function processImageJob(assetId: string, job?: any) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new Error("Asset not found");

  // Extract key (object name) from public path
  const url = new URL(asset.path);
  const objectKey = decodeURIComponent(
    url.pathname.replace(`/${MINIO_BUCKET_NAME}/`, "")
  ); // remove leading '/'

  const ext = path.extname(objectKey);
  const base = path.basename(objectKey, ext);
  const tempInput = `/tmp/${base}${ext}`;
  const thumbExt = `.${ext.replace(".", "") || "png"}`;
  const tempThumb = `/tmp/${base}-thumbnail${thumbExt}`;
  const thumbKey = `${base}-thumbnail${thumbExt}`;

  try {
    if (job) job.updateProgress(10);

    // 1. Download original image from MinIO
    const getCmd = new GetObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: objectKey,
    });
    const { Body } = await s3.send(getCmd);
    const stream = Body as Readable;

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tempInput);
      stream.pipe(file);
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    if (job) job.updateProgress(40);

    // Analyze metadata to keep same format
    const metadata = await sharp(tempInput).metadata();
    const format = metadata.format || "png";

    // 2. Create thumbnail using Sharp
    await sharp(tempInput).resize(300).toFile(tempThumb);
    if (job) job.updateProgress(70);

    // 3. Upload thumbnail back to MinIO (same bucket, public)
    const fileData = await fs.promises.readFile(tempThumb);
    const putCmd = new PutObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: thumbKey,
      Body: fileData,
      ContentType: `image/${format}`,
      ACL: "public-read", // make it publicly accessible
    });
    await s3.send(putCmd);

    if (job) job.updateProgress(90);

    // 4. Construct the public thumbnail URL
    const publicUrl = `${MINIO_ENDPOINT}/${MINIO_BUCKET_NAME}/${thumbKey}`;

    // 5. Update asset in DB
    asset.thumbnail = publicUrl;
    asset.status = "completed";
    asset.updatedAt = new Date();
    await asset.save();

    if (job) job.updateProgress(100);
    console.log(`✅ Thumbnail created and uploaded: ${publicUrl}`);
  } catch (err) {
    console.error("Error processing image job:", err);
    asset.status = "failed";
    asset.updatedAt = new Date();
    await asset.save();
    throw err;
  } finally {
    // Clean up temp files
    try {
      fs.existsSync(tempInput) && fs.unlinkSync(tempInput);

      const files = fs
        .readdirSync("/tmp")
        .filter((f) => f.includes("-thumbnail"));
      for (const f of files) fs.unlinkSync(`/tmp/${f}`);
    } catch (e) {
      console.warn("Temp cleanup failed:", e);
    }
  }
}
