import { useState } from "react";
import { AppContext } from "./app-context";
import type { ReactNode } from "react";
import type { Asset } from "../models/asset";
// import { v4 as uuidv4 } from "uuid";
import { fetchAssets, uploadAssets } from "../utils/api";

type Props = { children: ReactNode };

export const AppProvider = ({ children }: Props) => {
  const [assets, setAssets] = useState<Asset[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  // Add files and upload to backend
  const addFiles = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const uploadedAssets: Asset[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        console.log(`Uploading file ${i + 1} of ${selectedFiles.length}`);
        const file = selectedFiles[i];
        const asset = await uploadAssets(file, (progress) => {
          setUploadProgress(
            Math.round(((i + progress / 100) / selectedFiles.length) * 100)
          );
        });
        console.log("Uploaded asset:", asset);
        uploadedAssets.push(asset);
      }

      setAssets((prev) => [...prev, ...uploadedAssets]);
      setSelectedFiles([]); // clear selected files after upload
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // New: load assets from backend
  const loadAssets = async () => {
    try {
      const data = await fetchAssets();
      console.log("Fetched assets:", data);

      setAssets(data); // replace state with backend data
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        assets,
        addFiles,
        loadAssets,
        startUpload,
        selectedFiles,
        uploadProgress,
        uploading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
