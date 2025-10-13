import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadCard from "../upload-card";
import type { AppContextType } from "../../context/app-context";

// ---------- Strictly typed test mocks ----------

// Declare mutable test state
let mockSelectedFiles: File[] = [];
let mockUploading = false;
let mockUploadProgress = 0;

// Strongly type mocked context functions
const mockAddFiles: AppContextType["addFiles"] = jest.fn();
const mockStartUpload: AppContextType["startUpload"] = jest.fn();

// Mock the context hook strictly typed
jest.mock("../../context/app-context", () => ({
  useAppContext: (): AppContextType => ({
    selectedFiles: mockSelectedFiles,
    addFiles: mockAddFiles,
    startUpload: mockStartUpload,
    uploading: mockUploading,
    uploadProgress: mockUploadProgress,
    assets: [],
    loadAssets: jest.fn(),
  }),
}));

// Mock the lazy FileList component strictly typed
jest.mock("../file-list", () => ({
  __esModule: true,
  default: ({ assets }: { assets: File[] }) => (
    <div data-testid="file-list">Mock FileList ({assets.length} files)</div>
  ),
}));

describe("UploadCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedFiles = [];
    mockUploading = false;
    mockUploadProgress = 0;
  });

  it("renders upload prompt", () => {
    render(<UploadCard />);
    expect(screen.getByText(/Drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/Or click to select/i)).toBeInTheDocument();
  });

  it("calls addFiles on file drop", () => {
    render(<UploadCard />);
    const dropArea = screen.getByRole("button", {
      name: /Drag and drop files here/i,
    });

    const file = new File(["data"], "test.png", { type: "image/png" });
    const data = {
      dataTransfer: { files: [file] },
      preventDefault: () => {},
    } as unknown as React.DragEvent<HTMLDivElement>;

    fireEvent.drop(dropArea, data);
    expect(mockAddFiles).toHaveBeenCalledWith([file]);
  });

  it("renders FileList and Upload button when files exist", async () => {
    mockSelectedFiles = [new File(["x"], "demo.txt", { type: "text/plain" })];
    render(<UploadCard />);

    expect(await screen.findByTestId("file-list")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Upload files/i })
    ).toBeInTheDocument();
  });

  it("calls startUpload on Upload button click", async () => {
    mockSelectedFiles = [new File(["x"], "demo.txt", { type: "text/plain" })];
    render(<UploadCard />);

    const btn = await screen.findByRole("button", { name: /Upload files/i });
    fireEvent.click(btn);
    expect(mockStartUpload).toHaveBeenCalled();
  });

  it("shows upload progress and disables button when uploading", async () => {
    mockSelectedFiles = [new File(["x"], "demo.txt", { type: "text/plain" })];
    mockUploading = true;
    mockUploadProgress = 72;

    render(<UploadCard />);
    const btn = await screen.findByRole("button", { name: /Uploading 72%/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent("Uploading... 72%");
  });

  it("renders fallback and lazy FileList after suspense", async () => {
    mockSelectedFiles = [new File(["x"], "lazy.txt", { type: "text/plain" })];
    render(<UploadCard />);
    await waitFor(() =>
      expect(screen.getByTestId("file-list")).toBeInTheDocument()
    );
  });
});
