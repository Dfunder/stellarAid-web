export type ContactInput = {
  name: string;
  email: string;
  message: string;
  company?: string;
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function sanitizePlainText(value: string, maxLength = 2000) {
  return value
    .replace(CONTROL_CHARS, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(value: string) {
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return false;
  if (email.includes("..")) return false;
  return EMAIL_PATTERN.test(email);
}

export function validateContactInput(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = sanitizePlainText(input.name, 100);
  const email = input.email.trim();
  const message = sanitizePlainText(input.message, 2000);

  if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (message.length < 10) errors.message = "Message must be at least 10 characters.";

  return errors;
}

export function normalizeContactInput(input: ContactInput): ContactInput {
  return {
    name: sanitizePlainText(input.name, 100),
    email: input.email.trim().slice(0, 254),
    message: sanitizePlainText(input.message, 2000),
    company: sanitizePlainText(input.company ?? "", 100),
  };
}

export function checkContactRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
  now = Date.now(),
) {
  const current = rateLimitStore.get(key);
  if (!current || now >= current.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function resetContactRateLimitStore() {
  rateLimitStore.clear();
}
