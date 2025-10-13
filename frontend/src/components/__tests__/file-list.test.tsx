import { render, screen } from "@testing-library/react";
import FileList from "../file-list";

describe("FileList Component", () => {
  it("renders the title correctly", () => {
    render(<FileList assets={[]} />);
    expect(screen.getByText("Selected Files")).toBeInTheDocument();
  });

  it("renders list items for each file", () => {
    const files: File[] = [
      new File(["dummy"], "test1.png", { type: "image/png" }),
      new File(["dummy"], "test2.pdf", { type: "application/pdf" }),
    ];
    render(<FileList assets={files} />);
    expect(screen.getByText("test1.png")).toBeInTheDocument();
    expect(screen.getByText("test2.pdf")).toBeInTheDocument();
  });

  it("renders list items for each asset object", () => {
    const assets = [
      { filename: "report1.pdf", size: 2048 },
      { filename: "image1.jpg", size: 4096 },
    ];
    render(<FileList assets={assets} />);
    expect(screen.getByText("report1.pdf")).toBeInTheDocument();
    expect(screen.getByText("image1.jpg")).toBeInTheDocument();
  });

  it("shows correct size in KB with one decimal place", () => {
    const assets = [{ filename: "file.txt", size: 1024 }]; // 1 KB
    render(<FileList assets={assets} />);
    expect(screen.getByText("1.0 KB")).toBeInTheDocument();
  });

  it("renders mixed list of File and Asset", () => {
    const mixed: (File | { filename: string; size: number })[] = [
      new File(["dummy"], "local.txt", { type: "text/plain" }),
      { filename: "remote.pdf", size: 5120 },
    ];
    render(<FileList assets={mixed} />);
    expect(screen.getByText("local.txt")).toBeInTheDocument();
    expect(screen.getByText("remote.pdf")).toBeInTheDocument();
  });

  it("handles empty list gracefully", () => {
    render(<FileList assets={[]} />);
    const listItems = screen.queryAllByRole("listitem");
    expect(listItems.length).toBe(0);
  });

  it("renders file size rounded to one decimal", () => {
    const assets = [{ filename: "rounding.txt", size: 1536 }]; // 1.5 KB
    render(<FileList assets={assets} />);
    expect(screen.getByText("1.5 KB")).toBeInTheDocument();
  });
});
