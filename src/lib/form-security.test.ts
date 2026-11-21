import { describe, expect, it } from "vitest";
import {
  HONEYPOT_FIELD_NAME,
  isHoneypotFilled,
  isValidEmail,
  sanitizeMessage,
} from "./form-security";

describe("isValidEmail", () => {
  it("accepts trimmed, well-formed addresses", () => {
    expect(isValidEmail("  user@example.com ")).toBe(true);
  });

  it("rejects missing, malformed, or oversized addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("user")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
    expect(isValidEmail("user@@example.com")).toBe(false);
    expect(isValidEmail(`user@${"a".repeat(250)}.com`)).toBe(false);
  });
});

describe("sanitizeMessage", () => {
  it("escapes HTML-sensitive characters", () => {
    expect(sanitizeMessage(`<script>alert("x") & 'y'</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;",
    );
  });

  it("trims and collapses control whitespace", () => {
    expect(sanitizeMessage("  Hello\t\n\r world\u0000!  ")).toBe(
      "Hello world !",
    );
  });
});

describe("isHoneypotFilled", () => {
  it("uses a dedicated field name and detects filled honeypots", () => {
    expect(HONEYPOT_FIELD_NAME).toBe("company_website");
    expect(isHoneypotFilled("")).toBe(false);
    expect(isHoneypotFilled("   ")).toBe(false);
    expect(isHoneypotFilled("https://bot.example")).toBe(true);
  });
});
