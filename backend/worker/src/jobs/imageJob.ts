import sharp from "sharp";
import path from "path";
import Asset from "../api-types/AssetModel.js";

export async function processImageJob(assetId: string, job?: any) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new Error("Asset not found");

  const inputPath = asset.path;
  const thumbPath = path.join("uploads", `thumb-${path.basename(inputPath)}`);

  const steps = 2;

  // Step 1: read file
  if (job) job.updateProgress(50);

  // Step 2: create thumbnail
  await sharp(inputPath).resize(300).toFile(thumbPath);

  if (job) job.updateProgress(100);

  asset.thumbnail = thumbPath;
  asset.status = "completed";
  await asset.save();

  console.log(`Processed image thumbnail: ${thumbPath}`);
}
