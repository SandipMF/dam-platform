import type { Asset } from "../models/asset";

const API_BASE = "http://localhost:4000"; // backend URL

// Fetch all assets
export const fetchAssets = async () => {
  console.log("Fetching assets from API");
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
};

// Upload a single file
export const uploadAsset = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Failed to upload file: ${file.name}`);

  return res.json();
};

// Upload with progress callback
export const uploadAssets = (
  file: File,
  onProgress?: (percent: number) => void
) => {
  return new Promise<Asset>((resolve, reject) => {
    const formData = new FormData();
    formData.append("files", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);

    xhr.upload.onprogress = (event) => {
      console.log("Upload progress event:", event);
      if (event.lengthComputable && onProgress) {
        onProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        resolve(JSON.parse(xhr.response)[0]); // backend returns array
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
};
