import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("not-found boundary", () => {
  it("renders recovery links", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: /page not found/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: /project repository/i }),
    ).toHaveAttribute("href", "https://github.com/Dfunder/stellarAid-web");
  });
});
