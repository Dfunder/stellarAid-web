import { describe, expect, it } from "vitest";
import { metadata } from "../app/layout";
import { siteConfig } from "./site";

describe("siteConfig", () => {
  it("defines the product name, tagline and canonical URL", () => {
    expect(siteConfig.name).toBe("StellarAid");
    expect(siteConfig.tagline.length).toBeGreaterThan(0);
    expect(siteConfig.description).toContain(siteConfig.name);
    expect(() => new URL(siteConfig.url)).not.toThrow();
  });

  it("keeps navigation and footer links typed and labelled", () => {
    for (const link of [
      ...siteConfig.links.navigation,
      ...siteConfig.links.footer,
    ]) {
      expect(link.label.length).toBeGreaterThan(0);
      expect(link.href.length).toBeGreaterThan(0);
    }
  });

  it("derives the metadata from the same configuration", () => {
    const title = `${siteConfig.name} - ${siteConfig.tagline}`;

    expect(metadata.title).toBe(title);
    expect(metadata.description).toBe(siteConfig.description);
    expect(metadata.metadataBase?.href).toBe(new URL(siteConfig.url).href);
    expect(metadata.openGraph?.title).toBe(title);
    expect(metadata.twitter?.title).toBe(title);
  });
});
