const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const HONEYPOT_FIELD_NAME = "company_website";

export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (value.length < 5 || value.length > 254) return false;

  const [local = "", domain = ""] = value.split("@");
  if (local.length === 0 || local.length > 64) return false;
  if (local.includes("..") || domain.includes("..")) return false;
  if (!emailPattern.test(value)) return false;

  return domain.split(".").every((part) => part.length > 0);
}

export function sanitizeMessage(message: string): string {
  if (typeof message !== "string") return "";
  return message
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isHoneypotFilled(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
