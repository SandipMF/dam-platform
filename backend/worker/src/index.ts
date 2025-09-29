import dotenv from "dotenv";
import { assetWorker } from "./queue/assetQueue.js";

dotenv.config();

console.log("Worker started, waiting for jobs...");

