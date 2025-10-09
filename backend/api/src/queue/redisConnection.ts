import { Redis } from "ioredis";
import { ENV } from "../constants/env.ts";

// const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redisConnection = new Redis(ENV.REDIS_URL);
