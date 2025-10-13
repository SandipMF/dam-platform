import React, { Suspense } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import AdminDashboard from "../admin-dashboard";
import type { Asset } from "../../../models/asset";

// --- Mock lazy-loaded components ---
jest.mock("../../../components/admin/filters", () => {
  interface FiltersMockProps {
    search: string;
    setSearch: (value: string) => void;
    typeFilter: "all" | "image" | "video" | "other";
    setTypeFilter: (value: "all" | "image" | "video" | "other") => void;
  }
  return {
    __esModule: true,
    default: ({
      search,
      setSearch,
      typeFilter,
      setTypeFilter,
    }: FiltersMockProps) => (
      <div data-testid="filters-mock">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | "image" | "video" | "other")
          }
        >
          <option value="all">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="other">Other</option>
        </select>
      </div>
    ),
  };
});

jest.mock("../../../components/admin/asset-table", () => ({
  __esModule: true,
  default: ({
    assets,
    onPreview,
    onDownload,
  }: {
    assets: Asset[];
    onPreview: (id: string) => void;
    onDownload: (id: string, filename: string) => void;
  }) => (
    <div data-testid="asset-table-mock">
      {assets.map((a: Asset) => (
        <div key={a._id} data-testid={`asset-${a._id}`}>
          <span>{a.filename}</span>
          <button
            data-testid={`preview-${a._id}`}
            onClick={() => onPreview(a._id)}
          >
            Preview
          </button>
          <button
            data-testid={`download-${a._id}`}
            onClick={() => onDownload(a._id, a.filename)}
          >
            Download
          </button>
        </div>
      ))}
    </div>
  ),
}));

// --- Mock assets ---
const mockAssets: Asset[] = [
  {
    _id: "1",
    filename: "image.png",
    type: "image",
    size: 1024,
    createdAt: new Date().toISOString(),
    downloads: 0,
    path: "/assets/image.png",
    status: "processed",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    filename: "video.mp4",
    type: "video",
    size: 2048,
    createdAt: new Date().toISOString(),
    downloads: 3,
    path: "/assets/video.mp4",
    status: "processed",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    filename: "doc.txt",
    type: "other",
    size: 512,
    createdAt: new Date().toISOString(),
    downloads: 1,
    path: "/assets/doc.txt",
    status: "processed",
    updatedAt: new Date().toISOString(),
  },
];

beforeEach(() => {
  jest.restoreAllMocks();
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(mockAssets) } as Response)
  ) as jest.Mock;
});

const renderWithSuspense = async (ui: React.ReactElement) => {
  await act(async () => {
    render(<Suspense fallback={<div>Loading...</div>}>{ui}</Suspense>);
  });
};

describe("AdminDashboard", () => {
  it("renders title and lazy-loaded components", async () => {
    await renderWithSuspense(<AdminDashboard />);

    // Wait for lazy-loaded mocks
    const title = await screen.findByText(/Admin Dashboard/i);
    expect(title).toBeInTheDocument();

    await screen.findByTestId("filters-mock");
    await screen.findByTestId("asset-table-mock");
  });

  it("loads assets on mount", async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:4000/assets");
    });
  });

  it("filters assets by search", async () => {
    render(<AdminDashboard />);
    const searchInput = await screen.findByPlaceholderText(/Search.../i);

    fireEvent.change(searchInput, { target: { value: "video" } });

    await waitFor(() => {
      expect(screen.getByText(/video\.mp4/i)).toBeInTheDocument();
      expect(screen.queryByText(/image\.png/i)).toBeNull();
      expect(screen.queryByText(/doc\.txt/i)).toBeNull();
    });
  });

  it("filters assets by type", async () => {
    render(<AdminDashboard />);
    const typeSelect = await screen.findByRole("combobox");

    fireEvent.change(typeSelect, { target: { value: "image" } });

    await waitFor(() => {
      expect(screen.getByText(/image\.png/i)).toBeInTheDocument();
      expect(screen.queryByText(/video\.mp4/i)).toBeNull();
      expect(screen.queryByText(/doc\.txt/i)).toBeNull();
    });
  });

  it("calls window.open on Preview button click", async () => {
    await renderWithSuspense(<AdminDashboard />);

    await screen.findByTestId("asset-table-mock");

    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    // Use findBy to wait for the button to appear
    const previewButton = await screen.findByTestId("preview-1");
    fireEvent.click(previewButton);

    expect(openSpy).toHaveBeenCalledWith(
      "http://localhost:4000/assets/1/preview",
      "_blank"
    );

    openSpy.mockRestore();
  });

  it("creates anchor element and triggers download on Download button click", async () => {
    await renderWithSuspense(<AdminDashboard />);

    await screen.findByTestId("asset-table-mock");

    const clickMock = jest.fn();
    const anchor = document.createElement("a");
    anchor.click = clickMock;

    jest.spyOn(document, "createElement").mockReturnValue(anchor);
    const appendSpy = jest.spyOn(document.body, "appendChild");
    const removeSpy = jest.spyOn(document.body, "removeChild");

    const downloadButton = await screen.findByTestId("download-1");
    fireEvent.click(downloadButton);

    expect(appendSpy).toHaveBeenCalledWith(anchor);
    expect(clickMock).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(anchor);

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
