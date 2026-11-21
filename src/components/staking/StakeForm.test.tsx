import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StakeForm } from "./StakeForm";

const ACCOUNT = `GB${"A".repeat(54)}`;

function mockFetch(available: string): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [
      {
        asset_code: "XLM",
        asset_issuer: null,
        total_balance: "10",
        available_balance: available,
      },
    ],
  }) as unknown as typeof fetch;
}

describe("StakeForm", () => {
  it("blocks submission and reports an alert with both amounts when balance is too low", async () => {
    const onSubmit = vi.fn();
    render(
      <StakeForm account={ACCOUNT} fetchBalance={mockFetch("5")} onSubmit={onSubmit} />,
    );

    await screen.findByText(/Available: 5 XLM/);
    fireEvent.change(screen.getByLabelText("Amount (XLM)"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Stake" }));

    const alert = await screen.findByText(/Insufficient available balance/);
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert).toHaveTextContent("requested 10 XLM");
    expect(alert).toHaveTextContent("5 XLM");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits an amount covered by the available balance", async () => {
    const onSubmit = vi.fn();
    render(
      <StakeForm account={ACCOUNT} fetchBalance={mockFetch("5")} onSubmit={onSubmit} />,
    );

    await screen.findByText(/Available: 5 XLM/);
    fireEvent.change(screen.getByLabelText("Amount (XLM)"), {
      target: { value: "4.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Stake" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("4.5"));
  });
});
