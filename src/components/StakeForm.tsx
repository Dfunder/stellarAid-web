"use client";

import { useState } from "react";
import { getAssetPrecision } from "../config/assets";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { formatAssetAmount } from "../lib/format";
import {
  validateStakeAmount,
  type StakingValidationResult,
} from "../lib/staking-validation";

type StakePayload = {
  amount: string;
  stroops: bigint;
  asset: string;
};

type StakeFormProps = {
  asset?: string;
  availableBalance?: string;
  onSubmit?: (payload: StakePayload) => void | Promise<void>;
};

export function StakeForm({
  asset = "XLM",
  availableBalance = "1000",
  onSubmit,
}: StakeFormProps) {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<StakingValidationResult | null>(null);
  const { isSubmitting, submit } = useFormSubmission();
  const error = result && !result.ok ? result : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateStakeAmount({
      amount,
      available: availableBalance,
      precision: getAssetPrecision(asset),
    });
    setResult(validation);
    if (!validation.ok) return;

    await submit(async () => {
      await onSubmit?.({
        amount: validation.amount,
        stroops: validation.stroops,
        asset,
      });
    });
  }

  return (
    <section
      aria-labelledby="stake-heading"
      className="rounded-2xl border border-foreground/10 p-6"
    >
      <h2 id="stake-heading" className="text-xl font-semibold">
        Stake
      </h2>
      <p id="stake-available" className="mt-2 text-sm text-foreground/70">
        Available balance: {formatAssetAmount(availableBalance, asset)}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="stake-amount" className="font-medium">
            Amount ({asset})
          </label>
          <input
            id="stake-amount"
            name="amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? "stake-available stake-amount-error" : "stake-available"
            }
            className="rounded border px-3 py-2"
          />
          {error ? (
            <p
              id="stake-amount-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {error.message}
            </p>
          ) : null}
        </div>
        {result?.ok ? (
          <p role="status" className="text-sm text-foreground/80">
            Ready to stake {formatAssetAmount(result.amount, asset)} (
            {result.stroops} stroops).
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
    </section>
  );
}
