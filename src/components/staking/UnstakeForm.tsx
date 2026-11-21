"use client";

import { useState } from "react";
import { useFormSubmission } from "../../hooks/useFormSubmission";
import { validateAmountAgainstBalance } from "../../lib/stake-validation";

export type UnstakeFormProps = {
  stakedBalance: string;
  assetCode?: string;
  onSubmit?: (amount: string) => void | Promise<void>;
};

export function UnstakeForm({
  stakedBalance,
  assetCode = "XLM",
  onSubmit,
}: UnstakeFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isSubmitting, submit } = useFormSubmission();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    await submit(async () => {
      const result = validateAmountAgainstBalance(
        amount,
        stakedBalance,
        "unstake",
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
      <label htmlFor="unstake-amount" className="font-medium">
        Amount ({assetCode})
      </label>
      <input
        id="unstake-amount"
        name="amount"
        inputMode="decimal"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "unstake-error" : undefined}
        className="rounded border px-3 py-2"
      />
      <p className="text-sm text-foreground/70">
        Staked: {stakedBalance} {assetCode}
      </p>
      {error ? (
        <p id="unstake-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="self-start rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Unstaking..." : "Unstake"}
      </button>
    </form>
  );
}
