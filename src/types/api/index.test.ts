import { describe, expect, it } from "vitest";
import {
  mapCampaign,
  mapDonation,
  mapBalance,
  type ApiCampaign,
  type ApiDonation,
  type ApiBalance,
} from "./index";

describe("mapCampaign", () => {
  it("maps a campaign with a non-native asset", () => {
    const raw: ApiCampaign = {
      id: "camp-1",
      title: "Test Campaign",
      description: "A test",
      creator: "GABC123",
      target_amount: 10000,
      raised_amount: 2500,
      asset_code: "USDC",
      asset_issuer: "GDEV1234",
      status: "active",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-02T00:00:00Z",
    };

    const campaign = mapCampaign(raw);
    expect(campaign.targetAmount).toBe("10000");
    expect(campaign.raisedAmount).toBe("2500");
    expect(campaign.assetCode).toBe("USDC");
    expect(campaign.assetIssuer).toBe("GDEV1234");
  });

  it("maps a campaign with a null issuer (native XLM)", () => {
    const raw: ApiCampaign = {
      id: "camp-2",
      title: "XLM Campaign",
      description: "Native asset",
      creator: "GXYZ",
      target_amount: "50000.1234567",
      raised_amount: "100",
      asset_code: "XLM",
      asset_issuer: null,
      status: "pending",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };

    const campaign = mapCampaign(raw);
    expect(campaign.targetAmount).toBe("50000.1234567");
    expect(campaign.assetIssuer).toBeNull();
  });
});

describe("mapDonation", () => {
  it("maps a donation with string amounts preserved", () => {
    const raw: ApiDonation = {
      id: "don-1",
      campaign_id: "camp-1",
      donor: "GDONOR",
      amount: "42.5000000",
      asset_code: "USDC",
      asset_issuer: "GDEV1234",
      transaction_hash: "tx-hash-abc",
      created_at: "2025-01-03T00:00:00Z",
    };

    const donation = mapDonation(raw);
    expect(donation.amount).toBe("42.5000000");
    expect(donation.campaignId).toBe("camp-1");
  });
});

describe("mapBalance", () => {
  it("maps a balance with null issuer", () => {
    const raw: ApiBalance = {
      asset_code: "XLM",
      asset_issuer: null,
      total_balance: "1000",
      available_balance: "950",
    };

    const balance = mapBalance(raw);
    expect(balance.totalBalance).toBe("1000");
    expect(balance.availableBalance).toBe("950");
    expect(balance.assetIssuer).toBeNull();
  });
});
