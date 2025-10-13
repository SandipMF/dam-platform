import { render, screen, fireEvent } from "@testing-library/react";
import Filters from "../filters";
import type { AssetType } from "../../../models/asset";

describe("Filters Component", () => {
  const mockSetSearch = jest.fn();
  const mockSetTypeFilter = jest.fn();

  const setup = (search = "", typeFilter: AssetType | "all" = "all") => {
    render(
      <Filters
        search={search}
        setSearch={mockSetSearch}
        typeFilter={typeFilter}
        setTypeFilter={mockSetTypeFilter}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders search input and dropdown", () => {
    setup();
    expect(
      screen.getByPlaceholderText("Search by filename...")
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders all filter options", () => {
    setup();
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["All", "Images", "Videos", "Other"]);
  });

  test("renders correct initial values", () => {
    setup("cat", "video");
    expect(screen.getByPlaceholderText("Search by filename...")).toHaveValue(
      "cat"
    );
    expect(screen.getByRole("combobox")).toHaveValue("video");
  });

  test("calls setSearch when typing", () => {
    setup();
    const input = screen.getByPlaceholderText("Search by filename...");
    fireEvent.change(input, { target: { value: "dog" } });
    expect(mockSetSearch).toHaveBeenCalledWith("dog");
  });

  test("calls setTypeFilter when changing dropdown", () => {
    setup();
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "image" } });
    expect(mockSetTypeFilter).toHaveBeenCalledWith("image");
  });

  test("label connects correctly with input", () => {
    setup();
    const label = screen.getByLabelText("Search files");
    expect(label).toBeInTheDocument();
  });
});
