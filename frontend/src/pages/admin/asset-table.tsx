import type { Asset } from "../../models/asset";

interface AssetTableProps {
  assets: Asset[];
  onPreview: (assetId: string) => void;
  onDownload: (assetId: string, filename: string) => void;
}

export default function AssetTable({
  assets,
  onPreview,
  onDownload,
}: AssetTableProps) {
  return (
    <div className="w-full max-w-5xl">
      <table className="w-full border-collapse text-left text-gray-100">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2">Filename</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Size (KB)</th>
            <th className="px-4 py-2">Uploaded At</th>
            <th className="px-4 py-2">Downloads</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset._id} className="border-b border-gray-700">
              <td className="px-4 py-2 truncate">{asset.filename}</td>
              <td className="px-4 py-2">{asset.type}</td>
              <td className="px-4 py-2">{(asset.size / 1024).toFixed(1)}</td>
              <td className="px-4 py-2">
                {new Date(asset.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">{asset.downloads || 0}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => onPreview(asset._id)}
                  className="px-2 py-1 bg-blue-500 rounded text-xs"
                >
                  Preview
                </button>
                <button
                  onClick={() => onDownload(asset._id, asset.filename)}
                  className="px-2 py-1 bg-green-500 rounded text-xs"
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
