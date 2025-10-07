import dotenv from "dotenv";
import { assetWorker } from "./queue/assetQueue.ts";

dotenv.config();

console.log("Worker started, waiting for jobs...");

