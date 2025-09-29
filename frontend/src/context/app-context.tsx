import { createContext, useContext } from "react";
import type { Asset } from "../models/asset";

export type AppContextType = {
  assets: Asset[];
  selectedFiles: File[];
  addFiles: (files: File[]) => void;
  startUpload: () => void;
  loadAssets: () => void;
  uploading: boolean;
  uploadProgress: number;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
