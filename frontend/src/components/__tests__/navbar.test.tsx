import { TextEncoder, TextDecoder } from "util";

(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../navbar";

describe("Navbar Component", () => {
  it("renders the app title", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("📂 DAM Platform")).toBeInTheDocument();
  });

  it("renders two navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(2);
  });

  it("renders 'Upload' and 'Gallery' links correctly", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
  });

  it("links have correct 'to' attributes", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const uploadLink = screen.getByText("Upload");
    const galleryLink = screen.getByText("Gallery");
    expect(uploadLink.getAttribute("href")).toBe("/");
    expect(galleryLink.getAttribute("href")).toBe("/gallery");
  });

  it("applies Tailwind classes correctly", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("flex");
    expect(nav).toHaveClass("bg-gray-900");
    expect(nav).toHaveClass("text-white");
  });
});
