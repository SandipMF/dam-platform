import React from "react";
import { render, screen } from "@testing-library/react";
import Upload from "../upload";
import UploadCard from "../../components/upload-card";

jest.mock("../../components/upload-card", () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="upload-card-mock">Mock UploadCard</div>
  )),
}));

describe("Upload Page", () => {
  it("renders the UploadCard inside a styled container", () => {
    const { container } = render(<Upload />);

    // Ensure UploadCard mock appears
    expect(screen.getByTestId("upload-card-mock")).toBeInTheDocument();

    // The first child of the rendered container is the main wrapper div
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      "min-h-screen",
      "w-screen",
      "bg-gray-950",
      "text-gray-100",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "px-4"
    );
  });

  it("calls UploadCard mock (at least once)", () => {
    render(<Upload />);
    const UploadCardMock = UploadCard as unknown as jest.Mock;
    expect(UploadCardMock.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
