import FileList from "./file-list";
import { useAppContext } from "../context/app-context";

export default function UploadCard() {
  const { selectedFiles, addFiles, startUpload, uploading, uploadProgress } =
    useAppContext();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(Array.from(event.target.files));
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Upload Card */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-600 rounded-2xl p-8 
                   flex flex-col items-center justify-center text-center 
                   hover:border-blue-500 transition-colors bg-gray-900"
      >
        <p className="text-lg mb-4">Drag & drop files here</p>
        <label className="cursor-pointer text-blue-400 hover:underline">
          Or click to select
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
        </label>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && <FileList assets={selectedFiles} />}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <button
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
