import request from "supertest";
import express from "express";
import assetsRouter from "../assets.ts";
import { Asset } from "../../models/Asset.ts";
import { s3 } from "../../config/s3-config.ts";
import { PassThrough } from "stream";

// --- Create Express app for testing ---
const app = express();
app.use(express.json());
app.use("/assets", assetsRouter);

// --- Mock S3 ---
jest.mock("../../config/s3-config.ts", () => ({
  s3: {
    send: jest.fn(),
  },
}));

// --- Helper: fake stream ---
const mockStream = new PassThrough();
mockStream.end("fake file data");

describe("Assets Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Mock Asset.find & related queries ---
  const mockAssets = [
    {
      _id: "1",
      filename: "image.png",
      type: "image/png",
      path: "/assets/image.png",
      thumbnail: "/assets/thumb.png",
      downloads: 2,
      createdAt: new Date(),
    },
    {
      _id: "2",
      filename: "video.mp4",
      type: "video/mp4",
      path: "/assets/video.mp4",
      thumbnail: "/assets/thumb2.png",
      downloads: 3,
      createdAt: new Date(),
    },
  ];

  it("GET /assets - returns all assets", async () => {
    jest.spyOn(Asset, "find").mockReturnValue({
      sort: jest.fn().mockReturnValue(mockAssets),
    } as any);

    const res = await request(app).get("/assets");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].filename).toBe("image.png");
  });

  it("GET /assets/stats - returns stats", async () => {
    jest.spyOn(Asset, "countDocuments").mockResolvedValue(mockAssets.length);
    jest
      .spyOn(Asset, "aggregate")
      .mockResolvedValue([{ _id: null, total: 5 }]);
    jest.spyOn(Asset, "find").mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue(mockAssets),
      }),
    } as any);

    const res = await request(app).get("/assets/stats");
    expect(res.status).toBe(200);
    expect(res.body.totalAssets).toBe(2);
    expect(res.body.totalDownloads).toBe(5);
    expect(res.body.latestAssets.length).toBe(2);
  });

  it("GET /assets/:id/preview - streams preview", async () => {
    jest.spyOn(Asset, "findById").mockResolvedValue(mockAssets[0] as any);
    (s3.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    const res = await request(app).get("/assets/1/preview");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
  });

  it("GET /assets/:id/download - streams download", async () => {
    jest.spyOn(Asset, "findById").mockResolvedValue({
      ...mockAssets[0],
      save: jest.fn().mockResolvedValue(true),
    } as any);
    (s3.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    const res = await request(app).get("/assets/1/download");
    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-type"]).toBe("image/png");
  });

  it("GET /assets/:id/thumbnail - streams thumbnail", async () => {
    jest.spyOn(Asset, "findById").mockResolvedValue(mockAssets[0] as any);
    (s3.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    const res = await request(app).get("/assets/1/thumbnail");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
  });
});
