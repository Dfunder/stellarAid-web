import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowItWorks } from "./how-it-works";

describe("HowItWorks", () => {
  it("renders the six steps in order", () => {
    render(<HowItWorks />);

    const list = screen.getByRole("list");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(6);

    const titles = items.map((li) => li.querySelector("h3")?.textContent);
    expect(titles[0]).toBe("Connect your wallet");
    expect(titles[5]).toBe("Admin verification");
  });
});
