import ffmpeg from "fluent-ffmpeg";
import path from "path";
import Asset from "../api-types/AssetModel.ts";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";
import sharp from "sharp";

ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
ffmpeg.setFfprobePath(ffprobePath.path);

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "minioadmin";
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME ?? "mybucket";

const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

export async function processVideoJob(assetId: string, job?: any) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new Error("Asset not found");

  const url = new URL(asset.path);
  let objectKey = decodeURIComponent(
    url.pathname.replace(`/${MINIO_BUCKET_NAME}/`, "")
  );
  objectKey = objectKey.replace(/^(\.\.?\/|\/)+/, "");

  const ext = path.extname(objectKey);
  const base = path.basename(objectKey, ext);
  const dir = path.dirname(objectKey);

  const tempInput = `/tmp/${base}-original${ext}`;
  const tempOutput = `/tmp/${base}-compressed.mp4`;
  const tempThumb = `/tmp/${base}-thumbnail.png`;

  try {
    if (job) job.updateProgress(10);

    // 1. Download video from MinIO
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

    if (job) job.updateProgress(30);

    // 2. Extract metadata using ffprobe
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(tempInput, (err, data) => {
        if (err) return reject(err);
        else resolve(data);
      });
    });

    const { format, streams } = metadata;
    const videoStream = streams.find((s: any) => s.codec_type === "video");
    const meta = {
      duration: format.duration,
      size: format.size,
      codec: videoStream?.codec_name,
      width: videoStream?.width,
      height: videoStream?.height,
    };

    if (job) job.updateProgress(50);

    // 3. Compress video using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .outputOptions([
          "-vcodec libx264",
          "-preset fast",
          "-crf 28",
          "-acodec aac",
          "-b:a 128k",
        ])
        .on("progress", (p) => {
          if (job) job.updateProgress(50 + Math.min(p.percent ?? 0, 40) / 2);
        })
        .on("end", resolve)
        .on("error", reject)
        .save(tempOutput);
    });

    if (job) job.updateProgress(80);

    //Extract thumbnail at 2s using ffmpeg and sharp
    await new Promise((resolve, reject) => {
      ffmpeg(tempOutput)
        .screenshots({
          timestamps: ["2"], // capture at 2 seconds
          filename: `${base}-thumbnail.png`,
          folder: "/tmp",
          size: "300x?",
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // Optimize thumbnail using sharp
    const tempThumbOptimized = `/tmp/${base}-thumbnail-optimized.png`;
    await sharp(tempThumb).resize(300).toFile(tempThumbOptimized);

    // 4. Upload compressed video
    const fileData = await fs.promises.readFile(tempOutput);
    const cleanDir = dir.replace(/^(\.\.?\/)+/, "").replace(/^\/+/, "");
    const compressedKey = path.posix.join(cleanDir, `${base}-compressed.mp4`);

    const putCmd = new PutObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: compressedKey,
      Body: fileData,
      ContentType: "video/mp4",
      ACL: "public-read",
    });
    await s3.send(putCmd);

    const publicUrl = `${MINIO_ENDPOINT}/${MINIO_BUCKET_NAME}/${compressedKey}`;

    // Upload thumbnail
    const thumbData = await fs.promises.readFile(tempThumbOptimized);
    const thumbKey = `${base}-thumbnail.png`;
    await s3.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET_NAME,
        Key: thumbKey,
        Body: thumbData,
        ContentType: "image/png",
        ACL: "public-read",
      })
    );
    const thumbUrl = `${MINIO_ENDPOINT}/${MINIO_BUCKET_NAME}/${thumbKey}`;

    // 5. Update asset in DB
    asset.metadata = meta;
    asset.compressedPath = publicUrl;
    asset.thumbnail = thumbUrl;
    asset.status = "completed";
    asset.updatedAt = new Date();
    await asset.save();

    if (job) job.updateProgress(100);
    console.log(`Video processed and uploaded: ${publicUrl}`);
  } catch (err) {
    console.error("Error processing video job:", err);
    asset.status = "failed";
    asset.updatedAt = new Date();
    await asset.save();
    throw err;
  } finally {
    try {
      // Cleanup temp files
      [tempInput, tempOutput, tempThumb].forEach(
        (f) => fs.existsSync(f) && fs.unlinkSync(f)
      );
    } catch (e) {
      console.warn("Temp cleanup failed:", e);
    }
  }
}
