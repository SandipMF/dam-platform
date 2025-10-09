import { Queue } from "bullmq";
import {redisConnection} from "./redisConnection.ts"

// const connection = { host: "127.0.0.1", port: 6379 };
export const assetQueue = new Queue("assetQueue", { connection: redisConnection });
