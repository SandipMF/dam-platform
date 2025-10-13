import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Gallery from "../gallery";
import type { AppContextType } from "../../context/app-context";

// --- Mock Context ---
const mockLoadAssets: AppContextType["loadAssets"] = jest.fn();

let mockAssets: AppContextType["assets"] = [];

jest.mock("../../context/app-context", () => ({
  useAppContext: (): AppContextType => ({
    assets: mockAssets,
    loadAssets: mockLoadAssets,
    selectedFiles: [],
    addFiles: jest.fn(),
    startUpload: jest.fn(),
    uploading: false,
    uploadProgress: 0,
  }),
}));

describe("Gallery Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssets = [];
  });

  it("calls loadAssets on mount", () => {
    render(<Gallery />);
    expect(mockLoadAssets).toHaveBeenCalled();
  });

  it("renders empty state when no assets", () => {
    render(<Gallery />);
    expect(screen.getByText(/No files uploaded yet/i)).toBeInTheDocument();
  });

  it("renders assets correctly", () => {
    mockAssets = [
      {
        _id: "1",
        filename: "image.png",
        size: 2048,
        type: "image",
        createdAt: new Date().toISOString(),
        downloads: 5,
        path: "/assets/image.png",
        status: "pending",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "2",
        filename: "video.mp4",
        size: 10240,
        type: "video",
        createdAt: new Date().toISOString(),
        downloads: 2,
        path: "/assets/video.mp4",
        status: "pending",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "3",
        filename: "doc.txt",
        size: 512,
        type: "other",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/doc.txt",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<Gallery />);

    expect(screen.getByText("image.png")).toBeInTheDocument();
    expect(screen.getByText("video.mp4")).toBeInTheDocument();
    mockAssets = [
      {
        _id: "1",
        filename: "image.png",
        size: 1024,
        type: "image",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/image.png",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "2",
        filename: "video.mp4",
        size: 1024,
        type: "video",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/video.mp4",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
    ];
    expect(screen.getByText("2 downloads")).toBeInTheDocument();
    expect(screen.getByText("0 downloads")).toBeInTheDocument();
  });

  it("filters assets by search input", () => {
    mockAssets = [
      {
        _id: "1",
        filename: "image.png",
        size: 1024,
        type: "image",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/image.png",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "2",
        filename: "video.mp4",
        size: 1024,
        type: "video",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/video.mp4",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<Gallery />);
    const input = screen.getByPlaceholderText(/Search by filename/i);

    fireEvent.change(input, { target: { value: "video" } });
    expect(screen.queryByText("image.png")).not.toBeInTheDocument();
    expect(screen.getByText("video.mp4")).toBeInTheDocument();
  });

  it("filters assets by type select", async () => {
    mockAssets = [
      {
        _id: "1",
        filename: "image.png",
        size: 1024,
        type: "image",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/image.png",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "2",
        filename: "video.mp4",
        size: 1024,
        type: "video",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/video.mp4",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<Gallery />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "image" } });

    // Wait for the filtered element to appear
    const imageAsset = await screen.findByText((content) =>
      content.includes("image.png")
    );
    expect(imageAsset).toBeInTheDocument();

    // The video asset should not be present
    expect(
      screen.queryByText((content) => content.includes("video.mp4"))
    ).toBeNull();
  });

  it("calls window.open on Preview button click", () => {
    mockAssets = [
      {
        _id: "1",
        filename: "image.png",
        size: 1024,
        type: "image",
        createdAt: new Date().toISOString(),
        downloads: 0,
        path: "/assets/image.png",
        status: "processed",
        updatedAt: new Date().toISOString(),
      },
    ];

    // Spy on window.open inside the test
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    render(<Gallery />);

    const previewBtn = screen.getByRole("button", {
      name: /Preview file image.png/i,
    });
    fireEvent.click(previewBtn);

    expect(openSpy).toHaveBeenCalledWith(
      "http://localhost:4000/assets/1/preview",
      "_blank"
    );

    // Clean up spy
    openSpy.mockRestore();
  });
});
