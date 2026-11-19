import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioGrid } from "./PortfolioGrid";

describe("PortfolioGrid", () => {
  it("supports Tab and arrow-key navigation", () => {
    render(
      <PortfolioGrid
        items={[
          { id: "one", label: "First project", content: <span>First</span> },
          { id: "two", label: "Second project", content: <span>Second</span> },
        ]}
      />,
    );

    const first = screen.getByRole("gridcell", { name: "First project" });
    const second = screen.getByRole("gridcell", { name: "Second project" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(second).toHaveFocus();
  });
});
