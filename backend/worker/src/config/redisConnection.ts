import { Redis } from "ioredis";
import { ENV } from "../constants/env.ts";

export const connection = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,

  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
