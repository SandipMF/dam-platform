import ffmpeg from "fluent-ffmpeg";
import path from "path";
import Asset from "../api-types/AssetModel.ts";

export async function processVideoJob(assetId: string, job?: any) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new Error("Asset not found");

  const inputPath = asset.path;
  const thumbPath = path.join(
    "uploads",
    `thumb-${path.basename(inputPath)}.jpg`
  );

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .on("progress", (progress) => {
        if (job && progress.percent)
          job.updateProgress(Math.round(progress.percent));
      })
      .on("end", () => resolve())
      .on("error", reject)
      .screenshots({
        count: 1,
        folder: "uploads",
        filename: path.basename(thumbPath),
        size: "300x?",
      });
  });

  asset.thumbnail = thumbPath;
  asset.status = "completed";
  await asset.save();

  if (job) job.updateProgress(100);
  console.log(`Extracted video thumbnail: ${thumbPath}`);
}
