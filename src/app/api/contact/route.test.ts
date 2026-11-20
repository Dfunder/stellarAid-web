import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { resetContactRateLimitStore } from "@/lib/contact";

describe("POST /api/contact", () => {
  beforeEach(() => {
    resetContactRateLimitStore();
  });

  it("accepts a valid submission", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "1.1.1.1" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@example.com",
        message: "Hello there, this is a valid message.",
        company: "",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("rejects invalid payloads", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "2.2.2.2" },
      body: JSON.stringify({ name: "A", email: "bad", message: "short", company: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/invalid/i);
    expect(json.errors).toBeTruthy();
  });

  it("silently accepts honeypot submissions without processing", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "3.3.3.3" },
      body: JSON.stringify({
        name: "Bot",
        email: "bot@example.com",
        message: "spam spam spam spam",
        company: "Acme",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("rate limits repeated requests", async () => {
    const makeRequest = () =>
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "4.4.4.4" },
        body: JSON.stringify({
          name: "Alice",
          email: "alice@example.com",
          message: "Hello there, this is a valid message.",
          company: "",
        }),
      });

    for (let i = 0; i < 5; i += 1) {
      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
    }

    const limited = await POST(makeRequest());
    expect(limited.status).toBe(429);
  });
});
