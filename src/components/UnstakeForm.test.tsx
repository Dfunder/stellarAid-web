import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UnstakeForm } from "./UnstakeForm";

function submitForm() {
  const form = screen
    .getByRole("button", { name: /^unstake$/i })
    .closest("form");
  if (!form) throw new Error("form not rendered");
  fireEvent.submit(form);
}

describe("UnstakeForm", () => {
  it("shows an insufficient staked balance message with both amounts", async () => {
    render(<UnstakeForm stakedBalance="250" onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "300" },
    });
    submitForm();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/insufficient staked balance/i);
    expect(alert).toHaveTextContent(/requested 300, available 250/i);
    expect(screen.getByLabelText(/amount/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("blocks duplicate unstake submissions while one is in flight", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<UnstakeForm stakedBalance="10" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "2.25" },
    });
    const form = screen.getByRole("button", { name: /^unstake$/i }).closest("form");
    if (!form) throw new Error("form not rendered");
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const button = screen.getByRole("button", { name: /unstaking/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolveSubmit?.();
    });
  });

  it("submits a validated unstake amount", async () => {
    const onSubmit = vi.fn();
    render(<UnstakeForm stakedBalance="10" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "2.25" },
    });
    submitForm();

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        amount: "2.25",
        stroops: 22500000n,
        asset: "XLM",
      }),
    );
  });
});
