// import type { Asset } from "../models/asset";

type FileOrAsset = File | { filename: string; size: number }; // minimal properties

type FileListProps = {
  assets: FileOrAsset[];
};

export default function FileList({ assets }: FileListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Selected Files</h2>
      <ul className="space-y-2">
        {assets.map((asset, index) => {
          const name = "name" in asset ? asset.name : asset.filename;
          const size = asset.size / 1024;
          return (
            <li
              key={index}
              className="bg-gray-800 rounded-lg px-4 py-2 flex justify-between items-center"
            >
              <span className="truncate">{name}</span>
              <span className="text-gray-400 text-sm">
                {size.toFixed(1)} KB
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
