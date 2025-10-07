import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { processImageJob } from "../jobs/imageJob.ts";
import { processVideoJob } from "../jobs/videoJob.ts";
import { connection } from "./redisConnection.ts";

// Export queue to push jobs from backend API
export const assetQueue = new Queue("assetQueue", { connection });

// Worker listens to jobs
export const assetWorker = new Worker(
  "assetQueue",
  async (job) => {
    console.log("******** New Job Received ****", job.name);
    const { assetId, type } = job.data;
    console.log(`Started job ${job.id} for asset ${assetId} (${type})`);

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
  console.log(`Job ${job.id} completed for asset ${job.data.assetId}`);
});

// Listen to failed jobs
assetWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed for asset ${job?.data.assetId}`, err);
});

// Optional: log progress updates
assetWorker.on("progress", (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

assetWorker.on("active", (job) => {
  console.log(`Started job ${job.id} for ${job.data.assetId}`);
});

assetWorker.on("error", (err) => {
  console.error("Worker error:", err);
});
