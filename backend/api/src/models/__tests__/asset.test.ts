import { describe, it, expect } from "@jest/globals";
import { Asset } from "../Asset.ts";

describe("Asset model", () => {
  it("should create an Asset object", () => {
    const asset = new Asset({
      _id: "1",
      filename: "image.png",
      type: "image",
      size: 1024,
      path: "/assets/image.png",
      status: "processed",
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(asset.filename).toBe("image.png");
    expect(asset.type).toBe("image");
  });
});
