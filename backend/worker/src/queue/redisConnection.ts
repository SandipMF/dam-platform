import { Redis } from "ioredis";
// import IORedis from 'ioredis'

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const HOST = process.env.REDIS_HOST || "localhost";
const PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
// For some reason the URL connection string isn't working, so using host/port directly
// export const connection = new Redis({ url: redisUrl });
export const connection = new Redis({
  host: HOST,
  port: PORT,

  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
