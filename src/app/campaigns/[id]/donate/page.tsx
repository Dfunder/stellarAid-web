"use client";

import { use, useState } from "react";
import { getAssetPrecision } from "@/config/assets";

type Params = Promise<{ id: string }>;

const ASSETS = ["XLM", "USDC", "NGNT"];

function validateAmount(
  raw: string,
  target: string,
  assetCode: string,
): { ok: true; stroopSafe: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Amount is required" };

  const precision = getAssetPrecision(assetCode);
  const amountNum = Number(trimmed);
  if (Number.isNaN(amountNum) || amountNum <= 0) {
    return { ok: false, error: "Enter a valid positive number" };
  }

  if (amountNum > Number(target)) {
    return { ok: false, error: "Amount exceeds the campaign target" };
  }

  const decimals = trimmed.split(".")[1] ?? "";
  if (decimals.length > precision) {
    return { ok: false, error: `Maximum ${precision} decimal places for ${assetCode}` };
  }

  // Normalise to a stroop-safe string with full precision
  const [whole, fraction = ""] = trimmed.split(".");
  const paddedFraction = (fraction + "0".repeat(precision)).slice(0, precision);
  const stroopSafe = `${whole}${paddedFraction}`;

  return { ok: true, stroopSafe };
}

export default function DonatePage({ params }: { params: Params }) {
  const { id } = use(params);

  // Placeholder campaign data until the backend is available
  const campaign = {
    id,
    title: `Campaign ${id}`,
    targetAmount: "10000",
    assetCode: "XLM",
  };

  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<
    { ok: true; stroopSafe: string } | { ok: false; error: string } | null
  >(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(validateAmount(amount, campaign.targetAmount, campaign.assetCode));
  }

  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <section className="w-full px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-foreground/70">
            {campaign.title}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Donate</h1>
          <p className="mt-2 text-sm text-foreground/80">
            Target: {campaign.targetAmount} {campaign.assetCode}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-foreground"
              >
                Amount ({campaign.assetCode})
              </label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="mt-2 w-full rounded-lg border border-foreground/20 bg-background px-4 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="asset"
                className="block text-sm font-medium text-foreground"
              >
                Asset
              </label>
              <select
                id="asset"
                disabled
                className="mt-2 w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2 text-foreground/50"
              >
                {ASSETS.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-foreground/50">
                Asset selection is disabled until wallet connection is available.
              </p>
            </div>

            {result && !result.ok && (
              <p role="alert" className="text-sm text-red-600">
                {result.error}
              </p>
            )}
            {result && result.ok && (
              <p className="text-sm text-foreground/80">
                Validated stroop value: {result.stroopSafe}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
