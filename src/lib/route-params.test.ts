import { describe, expect, it } from "vitest";
import { validateRouteParam } from "./route-params";

describe("validateRouteParam", () => {
  it.each(["campaign-1", "Artist_42", "a", "a".repeat(64), "item-1_2"])(
    "accepts the safe id %s",
    (id) => {
      expect(validateRouteParam(id)).toEqual({ ok: true, value: id });
    },
  );

  it.each([
    ["", "non-empty"],
    ["   ", "non-empty"],
    ["a".repeat(65), "at most"],
    [" id", "whitespace"],
    ["../secret", "path traversal"],
    ["%2e%2e%2fetc", "path traversal"],
    ["%2Fetc%2Fpasswd", "encoded separators"],
    ["artist/1", "slashes"],
    ["artist\\1", "slashes"],
    ["' OR 1=1 --", "SQL metacharacters"],
    ["1;DROP TABLE artists", "SQL metacharacters"],
    ["artist@example.com", "unsupported characters"],
  ])("rejects the unsafe id %s", (id, reason) => {
    const result = validateRouteParam(id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(reason);
  });

  it("rejects non-string values", () => {
    expect(validateRouteParam(undefined).ok).toBe(false);
    expect(validateRouteParam(null).ok).toBe(false);
    expect(validateRouteParam(42).ok).toBe(false);
  });
});
