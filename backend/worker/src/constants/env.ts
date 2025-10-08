import dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const ENV = {
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000",
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME ?? "mybucket",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/dam",
};
