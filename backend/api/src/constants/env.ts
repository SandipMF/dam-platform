import dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const ENV = {
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000",
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME ?? "mybucket",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  PORT: process.env.PORT || 4000,
};
