// src/queue/__tests__/asset-queue.test.ts
import { processAssetJob } from "../assetQueue.ts";
import { processImageJob } from "../../jobs/imageJob.ts";
import { processVideoJob } from "../../jobs/videoJob.ts";
import { Job } from "bullmq";

jest.mock("../../jobs/imageJob.ts", () => ({
  processImageJob: jest.fn().mockResolvedValue("image done"),
}));

jest.mock("../../jobs/videoJob.ts", () => ({
  processVideoJob: jest.fn().mockResolvedValue("video done"),
}));

describe("assetQueue processor", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // reset call counts
  });

  it("should process image jobs", async () => {
    const job = {
      id: "1",
      name: "image-job",
      data: { assetId: "img123", type: "image" },
    } as unknown as Job;

    await processAssetJob(job);

    expect(processImageJob).toHaveBeenCalledWith("img123", job);
  });

  it("should process video jobs", async () => {
    const job = {
      id: "2",
      name: "video-job",
      data: { assetId: "vid456", type: "video" },
    } as unknown as Job;

    await processAssetJob(job);

    expect(processVideoJob).toHaveBeenCalledWith("vid456", job);
  });

  it("should ignore unknown types", async () => {
    const job = {
      id: "3",
      name: "unknown-job",
      data: { assetId: "abc789", type: "other" },
    } as unknown as Job;

    await processAssetJob(job);

    expect(processImageJob).not.toHaveBeenCalled();
    expect(processVideoJob).not.toHaveBeenCalled();
  });
});
