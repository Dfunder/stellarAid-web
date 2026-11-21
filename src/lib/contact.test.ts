import { describe, expect, it } from "vitest";
import {
  checkContactRateLimit,
  isValidEmail,
  normalizeContactInput,
  resetContactRateLimitStore,
  sanitizePlainText,
  validateContactInput,
} from "./contact";

describe("contact helpers", () => {
  it("validates emails conservatively", () => {
    expect(isValidEmail("person@example.com")).toBe(true);
    expect(isValidEmail("bad@@example.com")).toBe(false);
    expect(isValidEmail("bad..dots@example.com")).toBe(false);
    expect(isValidEmail("missing-domain@localhost")).toBe(false);
  });

  it("sanitizes plain text and strips tags/control chars", () => {
    expect(sanitizePlainText("  <b>Hello</b>\u0007 world  ")).toBe("Hello world");
  });

  it("returns validation errors for invalid submissions", () => {
    const errors = validateContactInput({
      name: "A",
      email: "not-an-email",
      message: "short",
      company: "",
    });
    expect(errors.name).toMatch(/name/i);
    expect(errors.email).toMatch(/email/i);
    expect(errors.message).toMatch(/message/i);
  });

  it("normalizes input", () => {
    const normalized = normalizeContactInput({
      name: "  <i>Alice</i>  ",
      email: "  alice@example.com ",
      message: "  <script>alert(1)</script>Hello there  ",
      company: "  <b>Acme</b> ",
    });
    expect(normalized).toEqual({
      name: "Alice",
      email: "alice@example.com",
      message: "alert(1)Hello there",
      company: "Acme",
    });
  });

  it("applies simple in-memory rate limiting", () => {
    resetContactRateLimitStore();
    const now = 1000;
    expect(checkContactRateLimit("ip", 2, 1000, now).allowed).toBe(true);
    expect(checkContactRateLimit("ip", 2, 1000, now).allowed).toBe(true);
    expect(checkContactRateLimit("ip", 2, 1000, now).allowed).toBe(false);
    expect(checkContactRateLimit("ip", 2, 1000, now + 1001).allowed).toBe(true);
  });
});
