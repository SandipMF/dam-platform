import { S3Client } from "@aws-sdk/client-s3";
import { s3 } from "../s3-config.ts";
import { ENV } from "../../constants/env.ts";

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation((config) => {
      return { config }; // simple mock returning config for testing
    }),
  };
});

describe("S3 Client Configuration", () => {
  it("should create S3 client with correct configuration", () => {
    // Access the mocked instance config
    const s3ClientConfig = (s3 as any).config;

    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(s3ClientConfig.endpoint).toBe(ENV.MINIO_ENDPOINT);
    expect(s3ClientConfig.region).toBe("us-east-1");
    expect(s3ClientConfig.credentials.accessKeyId).toBe(ENV.MINIO_ACCESS_KEY);
    expect(s3ClientConfig.credentials.secretAccessKey).toBe(
      ENV.MINIO_SECRET_KEY
    );
    expect(s3ClientConfig.forcePathStyle).toBe(true);
  });
});
