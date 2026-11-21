import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PortfolioGrid } from "./PortfolioGrid";

const items = [
  { id: "one", label: "First project", content: <span>First</span> },
  { id: "two", label: "Second project", content: <span>Second</span> },
  { id: "three", label: "Third project", content: <span>Third</span> },
];

describe("PortfolioGrid", () => {
  it("keeps one tabbable cell and moves it with arrow keys", () => {
    render(<PortfolioGrid items={items} />);

    const first = screen.getByRole("gridcell", { name: "First project" });
    const second = screen.getByRole("gridcell", { name: "Second project" });
    expect(screen.getByRole("row")).toBeInTheDocument();
    expect(first).toHaveAttribute("tabindex", "0");
    expect(second).toHaveAttribute("tabindex", "-1");

    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(second).toHaveFocus();
    expect(first).toHaveAttribute("tabindex", "-1");
    expect(second).toHaveAttribute("tabindex", "0");
  });

  it("updates the tabbable cell when focus changes", () => {
    render(<PortfolioGrid items={items} />);

    const first = screen.getByRole("gridcell", { name: "First project" });
    const third = screen.getByRole("gridcell", { name: "Third project" });

    third.focus();
    expect(third).toHaveAttribute("tabindex", "0");
    expect(first).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(third, { key: "Home" });
    expect(first).toHaveFocus();
    expect(third).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(first, { key: "End" });
    expect(third).toHaveFocus();
  });

  it("activates interactive cells with Enter and Space", () => {
    const activate = vi.fn();
    const open = vi.fn();
    render(
      <PortfolioGrid
        items={[
          {
            ...items[0],
            onActivate: activate,
          },
          {
            ...items[1],
            content: <button onClick={open}>Open</button>,
          },
        ]}
      />,
    );

    const first = screen.getByRole("gridcell", { name: "First project" });
    const second = screen.getByRole("gridcell", { name: "Second project" });

    fireEvent.keyDown(first, { key: "Enter" });
    fireEvent.keyDown(first, { key: " " });
    expect(activate).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(second, { key: "Enter" });
    expect(open).toHaveBeenCalledTimes(1);
  });
});
