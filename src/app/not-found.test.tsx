import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("not-found boundary", () => {
  it("renders the brand and recovery links from the shared route table", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: /page not found/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/stellaraid/i)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/Dfunder/stellarAid-web",
    );
  });
});
