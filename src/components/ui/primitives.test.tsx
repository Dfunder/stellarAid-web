import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import { Card } from "./Card";
import { Container } from "./Container";

describe("Button", () => {
  it("renders an anchor when href is provided", () => {
    render(<Button href="/campaigns">Browse campaigns</Button>);

    expect(screen.getByRole("link", { name: /browse campaigns/i })).toHaveAttribute(
      "href",
      "/campaigns",
    );
  });

  it("renders a button with a safe default type", () => {
    render(<Button>Donate</Button>);

    expect(screen.getByRole("button", { name: /donate/i })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("supports disabled buttons and anchors", () => {
    render(
      <>
        <Button disabled>Disabled button</Button>
        <Button href="/campaigns" disabled>
          Disabled link
        </Button>
      </>,
    );

    expect(screen.getByRole("button", { name: /disabled button/i })).toBeDisabled();
    expect(screen.getByText(/disabled link/i)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(/disabled link/i)).not.toHaveAttribute("href");
  });

  it("merges caller class overrides", () => {
    render(<Button className="px-2">Tiny</Button>);

    const button = screen.getByRole("button", { name: /tiny/i });
    expect(button).toHaveClass("px-2");
    expect(button).not.toHaveClass("px-6");
  });
});

describe("layout primitives", () => {
  it("renders Card content with merged classes", () => {
    render(<Card className="p-2">Card body</Card>);

    const card = screen.getByText(/card body/i);
    expect(card).toHaveClass("p-2");
    expect(card).not.toHaveClass("p-6");
  });

  it("renders Container content", () => {
    render(<Container>Container body</Container>);

    expect(screen.getByText(/container body/i)).toHaveClass("mx-auto");
  });
});
