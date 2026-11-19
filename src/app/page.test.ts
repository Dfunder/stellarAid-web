import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("home route", () => {
  it("stays a server component (no client JavaScript)", () => {
    const source = readFileSync(join(__dirname, "page.tsx"), "utf8");
    expect(source).not.toMatch(/["']use client["']/);
  });
});
