import { Schema, model, type Document } from "mongoose";

export interface AssetMetadata {
  duration?: number; // in seconds
  size?: number; // in bytes
  codec?: string;
  width?: number;
  height?: number;
}
export interface AssetDoc extends Document {
  filename: string;
  type: "image" | "video" | "other";
  size: number;
  path: string;
  status: "pending" | "processed" | "failed" | "completed";
  thumbnail?: string;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: AssetMetadata;
  compressedPath?: string;
}

const assetSchema = new Schema<AssetDoc>(
  {
    filename: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "other"], required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "failed", "completed"],
      default: "pending",
    },
    thumbnail: { type: String },
    downloads: { type: Number, default: 0 },
    compressedPath: { type: String },
    metadata: {
      duration: Number,
      size: Number,
      codec: String,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

export const Asset = model<AssetDoc>("Asset", assetSchema);
