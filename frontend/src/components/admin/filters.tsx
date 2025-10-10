import React from "react";
import type { AssetType } from "../../models/asset";

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
  typeFilter: AssetType | "all";
  setTypeFilter: (value: AssetType | "all") => void;
}

function Filters({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
}: FiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-5xl">
      <label htmlFor="search" className="sr-only">
        Search files
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
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value as AssetType | "all")}
        className="px-3 py-2 rounded bg-gray-800 text-gray-100"
      >
        <option value="all">All</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
}

export default React.memo(Filters);
