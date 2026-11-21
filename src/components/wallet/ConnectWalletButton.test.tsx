import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { useWallet } from "./WalletProvider";

vi.mock("./WalletProvider", () => ({ useWallet: vi.fn() }));

const connect = vi.fn(async () => {});

beforeEach(() => {
  connect.mockReset();
  vi.mocked(useWallet).mockReturnValue({
    address: null,
    status: "disconnected",
    error: null,
    connect,
    disconnect: vi.fn(),
    setError: vi.fn(),
  });
});

describe("ConnectWalletButton", () => {
  it("does not start a second connection while one is in progress", async () => {
    let resolveConnect: (() => void) | undefined;
    connect.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveConnect = resolve;
        }),
    );

    render(<ConnectWalletButton />);
    const button = screen.getByRole("button", { name: /connect wallet/i });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolveConnect?.();
    });
  });
});
