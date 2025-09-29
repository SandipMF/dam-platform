import { Queue } from "bullmq";
import {connection} from "./redisConnection.js"

// const connection = { host: "127.0.0.1", port: 6379 };
export const assetQueue = new Queue("assetQueue", { connection });
