import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UnstakeForm } from "./UnstakeForm";

describe("UnstakeForm", () => {
  it("blocks unstaking more than the staked balance with a clear alert", async () => {
    const onSubmit = vi.fn();
    render(<UnstakeForm stakedBalance="4" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Amount (XLM)"), {
      target: { value: "9" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Unstake" }));

    const alert = await screen.findByText(/Insufficient staked balance/);
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert).toHaveTextContent("requested 9 XLM");
    expect(alert).toHaveTextContent("4 XLM");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits an amount covered by the staked balance", async () => {
    const onSubmit = vi.fn();
    render(<UnstakeForm stakedBalance="4" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Amount (XLM)"), {
      target: { value: "2.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Unstake" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("2.5"));
  });
});
