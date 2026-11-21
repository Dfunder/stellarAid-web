import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioGrid } from "./PortfolioGrid";

describe("PortfolioGrid", () => {
  it("supports roving tabIndex and arrow-key navigation", () => {
    render(
      <PortfolioGrid
        items={[
          { id: "one", label: "First project", content: <span>First</span> },
          { id: "two", label: "Second project", content: <span>Second</span> },
          { id: "three", label: "Third project", content: <span>Third</span> },
        ]}
      />,
    );

    const first = screen.getByRole("gridcell", { name: "First project" });
    const second = screen.getByRole("gridcell", { name: "Second project" });
    const third = screen.getByRole("gridcell", { name: "Third project" });
    const grid = screen.getByRole("grid", { name: "Portfolio" });

    expect(grid).toBeInTheDocument();
    expect(screen.getByRole("row")).toBeInTheDocument();
    expect(first).toHaveAttribute("tabindex", "0");
    expect(second).toHaveAttribute("tabindex", "-1");
    expect(third).toHaveAttribute("tabindex", "-1");

    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("tabindex", "0");
    expect(first).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(second, { key: "ArrowLeft" });
    expect(first).toHaveFocus();
  });

  it("supports Home and End navigation", () => {
    render(
      <PortfolioGrid
        items={[
          { id: "one", label: "First project", content: <span>First</span> },
          { id: "two", label: "Second project", content: <span>Second</span> },
          { id: "three", label: "Third project", content: <span>Third</span> },
        ]}
      />,
    );

    const first = screen.getByRole("gridcell", { name: "First project" });
    const third = screen.getByRole("gridcell", { name: "Third project" });

    first.focus();
    fireEvent.keyDown(first, { key: "End" });
    expect(third).toHaveFocus();

    fireEvent.keyDown(third, { key: "Home" });
    expect(first).toHaveFocus();
  });

  it("handles empty items without rendering cells", () => {
    render(<PortfolioGrid items={[]} />);
    expect(screen.getByRole("grid", { name: "Portfolio" })).toBeInTheDocument();
    expect(screen.queryAllByRole("gridcell")).toHaveLength(0);
  });
});
