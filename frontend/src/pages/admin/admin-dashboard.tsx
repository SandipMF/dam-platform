import { useEffect, useState } from "react";
import type { Asset, AssetType } from "../../models/asset";
import Filters from "./filters";
import AssetTable from "./asset-table";

const API_BASE = "http://localhost:4000";

export default function AdminDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");

  const loadAssets = async () => {
    try {
      const res = await fetch(`${API_BASE}/assets`);
      const data: Asset[] = await res.json();
      setAssets(data);
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.filename
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = typeFilter === "all" ? true : asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handlePreview = (assetId: string) => {
    const url = `${API_BASE}/assets/${assetId}/preview`;
    window.open(url, "_blank");
  };

  const handleDownload = (assetId: string, filename: string) => {
    const url = `${API_BASE}/assets/${assetId}/download`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-950 text-gray-100 flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Filters
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      <AssetTable
        assets={filteredAssets}
        onPreview={handlePreview}
        onDownload={handleDownload}
      />
    </div>
  );
}
