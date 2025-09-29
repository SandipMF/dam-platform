export type AssetType = "image" | "video" | "document" | "other";

export interface Asset {
  _id: string; // match MongoDB _id
  filename: string; // match backend filename
  type: AssetType;
  size: number;
  path: string; // backend path/url
  status: "pending" | "processed" | "failed";
  thumbnail?: string;
  createdAt: string; // will parse to Date in frontend
  updatedAt: string;
  tags?: string[];
  downloads?: number;
}
