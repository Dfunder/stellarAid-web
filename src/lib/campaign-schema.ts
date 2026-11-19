import { assetPrecision, getAssetPrecision } from "@/config/assets";

export type CampaignDraft = {
  title: string;
  description: string;
  asset: string;
  targetAmount: string;
  deadline: string; // YYYY-MM-DD, optional
};

export type CampaignErrors = Partial<Record<keyof CampaignDraft, string>>;

export const emptyDraft: CampaignDraft = {
  title: "",
  description: "",
  asset: "XLM",
  targetAmount: "",
  deadline: "",
};

export function validateCampaign(
  draft: CampaignDraft,
  now: Date = new Date(),
): CampaignErrors {
  const errors: CampaignErrors = {};
  const title = draft.title.trim();
  if (title.length < 3 || title.length > 100) {
    errors.title = "Title must be 3 to 100 characters.";
  }
  if (draft.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters.";
  }
  if (!(draft.asset in assetPrecision)) {
    errors.asset = "Choose a supported asset.";
  }
  const amount = draft.targetAmount.trim();
  const decimals = amount.split(".")[1]?.length ?? 0;
  if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
    errors.targetAmount = "Target must be a positive number.";
  } else if (decimals > getAssetPrecision(draft.asset)) {
    errors.targetAmount = `Target allows at most ${getAssetPrecision(draft.asset)} decimal places.`;
  }
  if (draft.deadline) {
    const date = new Date(`${draft.deadline}T23:59:59Z`);
    if (Number.isNaN(date.getTime()) || date <= now) {
      errors.deadline = "Deadline must be in the future.";
    }
  }
  return errors;
}
