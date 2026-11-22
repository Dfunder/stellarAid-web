import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StakeForm } from "./StakeForm";

function submitForm() {
  const form = screen
    .getByRole("button", { name: /^stake$/i })
    .closest("form");
  if (!form) throw new Error("form not rendered");
  fireEvent.submit(form);
}

describe("StakeForm", () => {
  it("shows an insufficient balance message with both amounts", async () => {
    render(<StakeForm availableBalance="10" onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "20" },
    });
    submitForm();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/insufficient balance/i);
    expect(alert).toHaveTextContent(/requested 20, available 10/i);
    expect(screen.getByLabelText(/amount/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("blocks duplicate stake submissions while one is in flight", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<StakeForm availableBalance="100" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "5.5" },
    });
    const form = screen.getByRole("button", { name: /^stake$/i }).closest("form");
    if (!form) throw new Error("form not rendered");
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const button = screen.getByRole("button", { name: /staking/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolveSubmit?.();
    });
  });

  it("submits a validated amount in stroops", async () => {
    const onSubmit = vi.fn();
    render(<StakeForm availableBalance="100" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "5.5" },
    });
    submitForm();

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        amount: "5.5",
        stroops: 55000000n,
        asset: "XLM",
      }),
    );
  });
});
