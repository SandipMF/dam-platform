import { Schema, model, type Document } from "mongoose";

export interface AssetDoc extends Document {
  filename: string;
  type: "image" | "video" | "other";
  size: number;
  path: string;
  status: "pending" | "processed" | "failed";
  thumbnail?: string;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<AssetDoc>(
  {
    filename: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "other"], required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    thumbnail: { type: String },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Asset = model<AssetDoc>("Asset", assetSchema);
