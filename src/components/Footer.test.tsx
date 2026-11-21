import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders a footer landmark with reachable links", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /footer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/Dfunder/stellarAid-web",
    );
    expect(screen.getByRole("link", { name: /documentation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /report an issue/i })).toBeInTheDocument();

    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("focus-visible:outline-2");
      expect(link.className).toContain("focus-visible:outline-offset-2");
      expect(link.className).toContain("focus-visible:outline-foreground");
    }
  });

  it("gives footer nav links a visible focus indicator", () => {
    const home = screen.getByRole("link", { name: /^home/i });
    const github = screen.getByRole("link", { name: /github/i });
    for (const link of [home, github]) {
      expect(link.className).toContain("focus-visible:outline-2");
      expect(link.className).toContain("focus-visible:outline-foreground");
    }
  });

  it("marks external links as opening in a new tab", () => {
    render(<Footer />);

    const github = screen.getByRole("link", { name: /github/i });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });
});
