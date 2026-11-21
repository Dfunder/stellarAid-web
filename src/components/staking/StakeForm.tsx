"use client";

import { useEffect, useState } from "react";
import { useFormSubmission } from "../../hooks/useFormSubmission";
import { useStellarBalance } from "../../hooks/useStellarBalance";
import { validateAmountAgainstBalance } from "../../lib/stake-validation";

export type StakeFormProps = {
  account: string | null;
  assetCode?: string;
  fetchBalance?: typeof fetch;
  onSubmit?: (amount: string) => void | Promise<void>;
};

export function StakeForm({
  account,
  assetCode = "XLM",
  fetchBalance,
  onSubmit,
}: StakeFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { availableBalance, error: balanceError, refresh } =
    useStellarBalance(account, fetchBalance);
  const { isSubmitting, submit } = useFormSubmission();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    await submit(async () => {
      const result = validateAmountAgainstBalance(
        amount,
        availableBalance ?? "",
        "stake",
        assetCode,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (onSubmit) await onSubmit(amount.trim());
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <label htmlFor="stake-amount" className="font-medium">
        Amount ({assetCode})
      </label>
      <input
        id="stake-amount"
        name="amount"
        inputMode="decimal"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "stake-error" : undefined}
        className="rounded border px-3 py-2"
      />
      {availableBalance !== null ? (
        <p className="text-sm text-foreground/70">
          Available: {availableBalance} {assetCode}
        </p>
      ) : null}
      {balanceError ? (
        <p role="alert" className="text-sm text-red-600">
          {balanceError}
        </p>
      ) : null}
      {error ? (
        <p id="stake-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="self-start rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Staking..." : "Stake"}
      </button>
    </form>
  );
}
