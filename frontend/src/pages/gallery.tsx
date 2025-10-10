import { useEffect, useState } from "react";
import { useAppContext } from "../context/app-context";
// import { fetchAssets } from "../utils/api";

export default function Gallery() {
  const { assets, loadAssets } = useAppContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const API_BASE = "http://localhost:4000";

  useEffect(() => {
    console.log("Loading assets from backend...");
    loadAssets();
  }, []);

  // Filter assets based on search and type
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.filename
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : asset.type === filter;
    return matchesSearch && matchesFilter;
  });

  // To hadle preview
  const handlePreview = (assetId: string) => {
    const url = `${API_BASE}/assets/${assetId}/preview`;
    window.open(url, "_blank");
  };

  // To handle download
  const handleDownload = async (assetId: string, filename: string) => {
    try {
      const url = `${API_BASE}/assets/${assetId}/download`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <main className="min-h-screen w-screen bg-gray-950 text-gray-100 flex flex-col items-center px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Gallery</h1>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 w-full max-w-5xl">
        <label htmlFor="search" className="sr-only">
          Search filessss
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-gray-100 flex-1"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-gray-100"
        >
          <option value="all">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="other">Other</option>
        </select>
      </div>
      {filteredAssets.length === 0 ? (
        <p className="text-gray-400">No files uploaded yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {filteredAssets.map((asset) => (
            <article
              key={asset._id}
              className="bg-gray-800 rounded-lg p-4 shadow text-gray-200"
            >
              {/* Thumbnail */}
              {asset.type === "image" ? (
                <img
                  src={`http://localhost:4000/assets/${asset._id}/thumbnail`}
                  alt={`Preview thumbnail of ${asset.filename}`}
                  className="w-32 h-32 object-cover rounded-md mb-3"
                  loading="lazy"
                  decoding="async"
                />
              ) : asset.type === "video" ? (
                <img
                  src={`http://localhost:4000/assets/${asset._id}/thumbnail`}
                  alt={`Preview thumbnail of ${asset.filename}`}
                  className="w-32 h-32 object-cover rounded-md mb-3"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-700 flex items-center justify-center rounded-md mb-3">
                  <span className="text-xs text-gray-400">Other</span>
                </div>
              )}
              <p className="truncate">{asset.filename}</p>
              <p className="text-sm text-gray-400">
                {(asset.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-gray-400">Type: {asset.type}</p>
              <p className="text-sm text-gray-500">
                {new Date(asset.createdAt).toLocaleString()}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={() => handlePreview(asset._id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                  title={`Preview ${asset.filename}`}
                  aria-label={`Preview file ${asset.filename}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(asset._id, asset.filename)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Download
                </button>
              </div>

              {/* Download counter */}
              <p className="text-xs text-gray-400 mt-2">
                {asset.downloads || 0} downloads
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
