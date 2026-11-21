export type RouteParamResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

const MAX_PARAM_LENGTH = 64;
const SAFE_PARAM = /^[A-Za-z0-9_-]+$/;
const TRAVERSAL = /(?:\.\.|%2e)/i;
const ENCODED = /%[0-9a-f0-9]{2}/i;
const SLASHES = /[/\\]/;
const SQL_METACHARACTERS = /['"`;()=|]|--/;

export function validateRouteParam(value: unknown): RouteParamResult {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "Route parameter must be a non-empty string" };
  }
  if (value.length > MAX_PARAM_LENGTH) {
    return {
      ok: false,
      error: `Route parameter must be at most ${MAX_PARAM_LENGTH} characters`,
    };
  }
  if (value !== value.trim()) {
    return { ok: false, error: "Route parameter must not contain surrounding whitespace" };
  }
  if (TRAVERSAL.test(value)) {
    return { ok: false, error: "Route parameter must not contain path traversal" };
  }
  if (ENCODED.test(value)) {
    return { ok: false, error: "Route parameter must not contain encoded separators" };
  }
  if (SLASHES.test(value)) {
    return { ok: false, error: "Route parameter must not contain slashes" };
  }
  if (SQL_METACHARACTERS.test(value)) {
    return { ok: false, error: "Route parameter must not contain SQL metacharacters" };
  }
  if (!SAFE_PARAM.test(value)) {
    return { ok: false, error: "Route parameter contains unsupported characters" };
  }
  return { ok: true, value };
}
