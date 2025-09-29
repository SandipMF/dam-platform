import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { processImageJob } from "../jobs/imageJob.js";
import { processVideoJob } from "../jobs/videoJob.js";
import { connection } from "./redisConnection.js";

// const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Export queue to push jobs from backend API
export const assetQueue = new Queue("assetQueue", { connection });

// Worker listens to jobs
export const assetWorker = new Worker(
  "assetQueue",
  async (job) => {
    const { assetId, type } = job.data;
    console.log(`🔹 Started job ${job.id} for asset ${assetId} (${type})`);

    if (type === "image") {
      await processImageJob(assetId, job); // pass job for progress
    } else if (type === "video") {
      await processVideoJob(assetId, job); // pass job for progress
    }
  },
  { connection }
);

// Listen to completed jobs
assetWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed for asset ${job.data.assetId}`);
});

// Listen to failed jobs
assetWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed for asset ${job?.data.assetId}`, err);
});

// Optional: log progress updates
assetWorker.on("progress", (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});
