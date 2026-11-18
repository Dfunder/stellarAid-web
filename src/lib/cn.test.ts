import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins class names and ignores falsy values", () => {
    expect(cn("flex", false && "hidden", null, undefined, "gap-4")).toBe(
      "flex gap-4",
    );
  });

  it("supports arrays and objects", () => {
    expect(cn(["px-2", "py-2"], { "text-sm": true, hidden: false })).toBe(
      "px-2 py-2 text-sm",
    );
  });

  it("keeps the last conflicting utility", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("bg-background", "bg-foreground")).toBe("bg-foreground");
  });

  it("does not merge utilities with different variants", () => {
    expect(cn("hover:opacity-50", "hover:opacity-90", "opacity-100")).toBe(
      "hover:opacity-90 opacity-100",
    );
  });
});
