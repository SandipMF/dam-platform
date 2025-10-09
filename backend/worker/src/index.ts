import dotenv from "dotenv";
import { assetWorker } from "./queue/assetQueue.ts";
import { connectDB } from "./config/db-config.ts";
import { connection } from "./queue/redisConnection.ts";

dotenv.config();

// Connect to MongoDB
(async () => {
  assetWorker.on("ready", () => {
    console.log(`Worker is ready and connected to Redis, waiting for jobs...`);
  });

  await connectDB();
  console.log("Worker connected to MongoDB and waiting for jobs...");

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    console.log(`\n Received ${signal}. Stopping worker gracefully...`);
    try {
      await assetWorker.close(); //stop accepting new jobs
      await connection.quit(); // close redis connection

      console.log("Worker stopped cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  // Listen for stop signals (works in Docker or Ctrl+C)
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
})();
