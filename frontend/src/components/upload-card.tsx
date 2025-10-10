// import FileList from "./file-list";
import React, { lazy, Suspense, useCallback } from "react";
import { useAppContext } from "../context/app-context";

const FileList = lazy(() => import("./file-list"));

function UploadCard() {
  const { selectedFiles, addFiles, startUpload, uploading, uploadProgress } =
    useAppContext();

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      addFiles(Array.from(event.dataTransfer.files));
    },
    [addFiles]
  );

  const handleSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        addFiles(Array.from(event.target.files));
      }
    },
    [addFiles]
  );

  return (
    <div className="w-full max-w-lg">
      {/* Upload Card */}
      <div
        role="button"
        aria-label="Drag and drop files here or click to select files"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-600 rounded-2xl p-8 
                   flex flex-col items-center justify-center text-center 
                   hover:border-blue-500 transition-colors bg-gray-900"
      >
        <p className="text-lg mb-4">Drag & drop files here</p>
        <label
          htmlFor="file-input"
          className="cursor-pointer text-blue-400 hover:underline"
        >
          Or click to select
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
        </label>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <Suspense fallback={<p>Loading files...</p>}>
          <FileList assets={selectedFiles} />
        </Suspense>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <button
          aria-busy={uploading}
          aria-label={
            uploading ? `Uploading ${uploadProgress}%` : "Upload files"
          }
          onClick={startUpload}
          disabled={uploading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {uploading ? `Uploading... ${uploadProgress}%` : "Upload"}
        </button>
      )}
    </div>
  );
}

export default React.memo(UploadCard);
