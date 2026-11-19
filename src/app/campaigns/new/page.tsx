"use client";

import { useEffect, useState } from "react";
import { assetPrecision } from "@/config/assets";
import {
  emptyDraft,
  validateCampaign,
  type CampaignDraft,
  type CampaignErrors,
} from "@/lib/campaign-schema";

const DRAFT_KEY = "stellaraid:campaign-draft";

export default function NewCampaignPage() {
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft);
  const [errors, setErrors] = useState<CampaignErrors>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) });
    } catch {
      // storage unavailable or corrupt: start empty
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [draft, loaded]);

  const update = (field: keyof CampaignDraft, value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  // Validation only: this form intentionally never submits anything.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(validateCampaign(draft));
  };

  const field = (
    name: keyof CampaignDraft,
    label: string,
    control: React.ReactNode,
  ) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      {control}
      {errors[name] ? (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-600">
          {errors[name]}
        </p>
      ) : null}
    </div>
  );

  const aria = (name: keyof CampaignDraft) => ({
    id: name,
    name,
    value: draft[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: "rounded border px-3 py-2",
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold">Create a campaign</h1>
      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
        {field(
          "title",
          "Title",
          <input {...aria("title")} onChange={(e) => update("title", e.target.value)} />,
        )}
        {field(
          "description",
          "Description",
          <textarea
            {...aria("description")}
            rows={5}
            onChange={(e) => update("description", e.target.value)}
          />,
        )}
        {field(
          "asset",
          "Asset",
          <select {...aria("asset")} onChange={(e) => update("asset", e.target.value)}>
            {Object.keys(assetPrecision).map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>,
        )}
        {field(
          "targetAmount",
          "Target amount",
          <input
            {...aria("targetAmount")}
            inputMode="decimal"
            onChange={(e) => update("targetAmount", e.target.value)}
          />,
        )}
        {field(
          "deadline",
          "Deadline (optional)",
          <input
            {...aria("deadline")}
            type="date"
            onChange={(e) => update("deadline", e.target.value)}
          />,
        )}
        <button type="submit" className="self-start rounded border px-4 py-2">
          Validate draft
        </button>
      </form>
    </main>
  );
}
