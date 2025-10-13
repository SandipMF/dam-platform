import { render, screen, fireEvent } from "@testing-library/react";
import AssetTable from "../asset-table";
import type { Asset, AssetType } from "../../../models/asset";

describe("AssetTable Component", () => {
  const mockOnPreview = jest.fn();
  const mockOnDownload = jest.fn();

  const mockAssets: Asset[] = [
    {
      _id: "1",
      filename: "photo.jpg",
      type: "image" as AssetType,
      size: 2048,
      path: "/uploads/photo.jpg",
      status: "processed",
      createdAt: "2024-10-05T12:00:00Z",
      updatedAt: "2024-10-05T12:00:00Z",
      downloads: 5,
    },
  ];

  beforeEach(() => jest.clearAllMocks());

  test("renders table headers", () => {
    render(
      <AssetTable
        assets={mockAssets}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    const headers = [
      "Filename",
      "Type",
      "Size (KB)",
      "Uploaded At",
      "Downloads",
      "Actions",
    ];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test("renders correct number of rows", () => {
    render(
      <AssetTable
        assets={mockAssets}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    const rows = screen.getAllByRole("row");
    // 1 header row + 2 data rows
    expect(rows.length).toBe(2);
  });

  test("renders asset data correctly", () => {
    render(
      <AssetTable
        assets={mockAssets}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    expect(screen.getByText("photo.jpg")).toBeInTheDocument();
    expect(screen.getByText("image")).toBeInTheDocument();
    expect(screen.getByText("2.0")).toBeInTheDocument(); // 2048 bytes → 2.0 KB
    // expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("calls onPreview when preview button clicked", () => {
    render(
      <AssetTable
        assets={mockAssets}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    const previewButton = screen.getByLabelText("Preview photo.jpg");
    fireEvent.click(previewButton);
    expect(mockOnPreview).toHaveBeenCalledWith("1");
  });

  test("calls onDownload when download button clicked", () => {
    render(
      <AssetTable
        assets={mockAssets}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    const downloadButton = screen.getAllByText("Download")[0];
    fireEvent.click(downloadButton);
    expect(mockOnDownload).toHaveBeenCalledWith("1", "photo.jpg");
  });

  test("renders 0 downloads when downloads is missing or 0", () => {
    const assets = [{ ...mockAssets[1], downloads: undefined }];
    render(
      <AssetTable
        assets={assets}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("renders empty table body when no assets", () => {
    render(
      <AssetTable
        assets={[]}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    const rows = screen.queryAllByRole("row");
    expect(rows.length).toBe(1); // Only header row
  });
});
