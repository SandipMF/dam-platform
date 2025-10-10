import { render, screen, fireEvent } from "@testing-library/react";
import Filters from "../filters";

describe("Filters Component", () => {
  const mockSetSearch = jest.fn();
  const mockSetTypeFilter = jest.fn();

  test("renders input and select", () => {
    render(
      <Filters
        search=""
        setSearch={mockSetSearch}
        typeFilter="all"
        setTypeFilter={mockSetTypeFilter}
      />
    );

    // Input
    const input = screen.getByPlaceholderText(/search by filename/i);
    expect(input).toBeInTheDocument();

    // Select
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  test("calls callbacks on change", () => {
    render(
      <Filters
        search=""
        setSearch={mockSetSearch}
        typeFilter="all"
        setTypeFilter={mockSetTypeFilter}
      />
    );

    const input = screen.getByPlaceholderText(/search by filename/i);
    fireEvent.change(input, { target: { value: "file.jpg" } });
    expect(mockSetSearch).toHaveBeenCalledWith("file.jpg");

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "image" } });
    expect(mockSetTypeFilter).toHaveBeenCalledWith("image");
  });
});
