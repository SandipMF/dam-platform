import dotenv from "dotenv";
import { assetWorker } from "./queue/assetQueue.ts";
import { connectDB } from "./config/db-config.ts";

dotenv.config();

// console.log("Worker started, waiting for jobs...");

// Connect to MongoDB
(async () => {
  assetWorker.on("ready", () => {
    console.log(
      `🚀 Worker is ready and connected to Redis, waiting for jobs...`
    );
  });

  await connectDB();
  console.log("🚀 Worker connected to MongoDB and waiting for jobs...");
})();

/*
// import { Job, Queue, Worker } from "bullmq";
// import { connection } from "./queue/redisConnection.ts";
// import { processImageJob } from "./jobs/imageJob.ts";
// import { processVideoJob } from "./jobs/videoJob.ts";

const assetQueue = new Queue("assetQueue", { connection });

interface AssetJobData {
  assetId: string;
  type: "image" | "video";
}
// Worker listens to jobs
const assetWorker = new Worker(
  "assetQueue",
  async (job: Job<AssetJobData>) => {
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
assetWorker.on("completed", (job: Job<AssetJobData>) => {
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
*/
