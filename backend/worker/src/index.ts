import dotenv from "dotenv";
import { assetWorker } from "./queue/assetQueue.ts";
import { connectDB } from "./config/db-config.ts";

dotenv.config();

// Connect to MongoDB
(async () => {
  assetWorker.on("ready", () => {
    console.log(`Worker is ready and connected to Redis, waiting for jobs...`);
  });

  await connectDB();
  console.log("Worker connected to MongoDB and waiting for jobs...");
})();
