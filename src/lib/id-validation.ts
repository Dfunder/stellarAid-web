import { isNonZeroAddress, isStellarAddress } from "./address-validation";

const MAX_ID_LENGTH = 128;
const SLUG = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const HEX_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const FORBIDDEN = /[\0%\\/]|\.\.|--|<|>|["'`;]|\s/;

export type IdValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateId(input: unknown): IdValidationResult {
  if (typeof input !== "string") {
    return { ok: false, error: "ID must be a non-empty string." };
  }

  const value = input.trim();
  if (!value) {
    return { ok: false, error: "ID must be a non-empty string." };
  }
  if (value.length > MAX_ID_LENGTH) {
    return { ok: false, error: `ID must be at most ${MAX_ID_LENGTH} characters.` };
  }
  if (FORBIDDEN.test(value)) {
    return {
      ok: false,
      error: "ID contains disallowed characters such as traversal sequences, encoded slashes, null bytes or injection payloads.",
    };
  }
  if (!SLUG.test(value) && !HEX_ADDRESS.test(value) && !isStellarAddress(value)) {
    return {
      ok: false,
      error: "ID must use letters, numbers, hyphens or underscores, or be a valid address.",
    };
  }
  if (!isNonZeroAddress(value)) {
    return { ok: false, error: "The zero address is not a valid ID." };
  }

  return { ok: true, value };
}

export function validateAddress(input: unknown): IdValidationResult {
  const result = validateId(input);
  if (!result.ok) return result;
  if (!isStellarAddress(result.value) && !HEX_ADDRESS.test(result.value)) {
    return { ok: false, error: "Address must be a valid account or hex address." };
  }
  return result;
}
