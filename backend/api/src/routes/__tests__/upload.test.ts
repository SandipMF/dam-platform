import request from "supertest";
import express from "express";
import multer from "multer";
import uploadRouter from "../upload.ts";
import { Asset } from "../../models/Asset.ts";
import { assetQueue } from "../../queue/assetQueue.ts";
import { s3 } from "../../config/s3-config.ts";
import { PassThrough } from "stream";

// --- Setup test app ---
const app = express();
app.use(express.json());
app.use("/upload", uploadRouter);

// --- Mocks ---
jest.mock("../../models/Asset.ts");
jest.mock("../../queue/assetQueue.ts", () => ({
  assetQueue: { add: jest.fn() },
}));
jest.mock("../../config/s3-config.ts", () => ({
  s3: { send: jest.fn() },
}));

// Helper stream
const mockStream = new PassThrough();
mockStream.end("fake file data");

describe("Upload Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /upload - uploads files and creates assets", async () => {
    // Mock DB save
    const mockSave = jest.fn();
    mockSave.mockResolvedValue({
      _id: "123",
      filename: "test.png",
      type: "image",
      size: 100,
      path: "",
      status: "pending",
      uploadedAt: new Date(),
      updatedAt: new Date(),
      save: mockSave,
    });

    (Asset as any).mockImplementation(() => ({ save: mockSave }));

    // Mock S3 upload
    (s3.send as jest.Mock).mockResolvedValue(mockStream);

    // Perform upload request
    const res = await request(app)
      .post("/upload")
      .attach("files", Buffer.from("filecontent"), "test.png");

    expect(res.status).toBe(201);
    expect(res.body.length).toBe(1);
    expect(res.body[0].filename).toBe("test.png");

    // Asset should be saved twice (pre-create + update path)
    expect(mockSave).toHaveBeenCalledTimes(2);

    // S3 send called
    expect(s3.send).toHaveBeenCalledTimes(1);

    // Queue job added
    expect(assetQueue.add).toHaveBeenCalledTimes(1);
    expect(assetQueue.add).toHaveBeenCalledWith("process", {
      assetId: "123",
      type: "image",
    });
  });

  it("POST /upload - returns 500 on error", async () => {
    (Asset as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("DB error")),
    }));

    const res = await request(app)
      .post("/upload")
      .attach("files", Buffer.from("filecontent"), "test.png");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Upload failed");
  });
});
