import mongoose, { Document, Schema } from "mongoose";

export interface AssetDoc extends Document {
  filename: string;
  type: "image" | "video" | "other";
  size: number;
  path: string;
  thumbnail?: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  
  downloads: number;
  updatedAt: Date;
}

const assetSchema = new Schema<AssetDoc>(
  {
    filename: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "other"], required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    thumbnail: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Asset = mongoose.model<AssetDoc>("Asset", assetSchema);
export default Asset;
