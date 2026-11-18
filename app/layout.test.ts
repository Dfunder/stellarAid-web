import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "absolute" in value) {
    return String((value as { absolute?: string }).absolute ?? "");
  }
  return "";
}

describe("metadata", () => {
  it("defines a StellarAid title and description", () => {
    expect(text(metadata.title)).toContain("StellarAid");
    expect(text(metadata.description)).toContain("StellarAid");
    expect(text(metadata.title)).not.toMatch(/create next app/i);
  });

  it("reuses the title in the OpenGraph and Twitter blocks", () => {
    const title = text(metadata.title);
    expect(text(metadata.openGraph?.title)).toBe(title);
    expect(text(metadata.twitter?.title)).toBe(title);
  });

  it("uses an absolute metadata base URL", () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect(metadata.metadataBase?.protocol).toMatch(/^https?:$/);
  });
});
