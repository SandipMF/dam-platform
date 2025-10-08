import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../constants/env.ts";

// Initialize S3 client for MinIO
export const s3 = new S3Client({
  endpoint: ENV.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: ENV.MINIO_ACCESS_KEY,
    secretAccessKey: ENV.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});
