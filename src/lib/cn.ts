export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function flatten(value: ClassValue, output: string[]): void {
  if (!value) return;

  if (typeof value === "string" || typeof value === "number") {
    output.push(
      ...String(value)
        .split(/\s+/)
        .filter(Boolean),
    );
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      flatten(entry, output);
    }
    return;
  }

  for (const [className, enabled] of Object.entries(value)) {
    if (enabled) output.push(className);
  }
}

function conflictGroup(token: string): string | undefined {
  const separator = token.lastIndexOf(":");
  const variant = separator >= 0 ? token.slice(0, separator + 1) : "";
  const base = separator >= 0 ? token.slice(separator + 1) : token;

  if (/^(p|px|py|pt|pr|pb|pl)-/.test(base)) {
    return `${variant}padding-${base.split("-")[0]}`;
  }
  if (/^(m|mx|my|mt|mr|mb|ml)-/.test(base)) {
    return `${variant}margin-${base.split("-")[0]}`;
  }
  if (/^bg-/.test(base)) return `${variant}background`;
  if (/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(base)) {
    return `${variant}text-size`;
  }
  if (/^text-/.test(base)) return `${variant}text-color`;
  if (/^font-/.test(base)) return `${variant}font`;
  if (/^rounded/.test(base)) return `${variant}rounded`;
  if (/^(w|h)-/.test(base)) return `${variant}${base.split("-")[0]}-size`;
  if (/^(max-w|max-h|min-w|min-h)-/.test(base)) {
    return `${variant}${base.split("-").slice(0, 2).join("-")}-size`;
  }
  if (/^(flex|grid|block|inline|hidden|contents|table)$/.test(base)) {
    return `${variant}display`;
  }
  if (/^items-/.test(base)) return `${variant}items`;
  if (/^justify-/.test(base)) return `${variant}justify`;
  if (/^gap-/.test(base)) return `${variant}gap`;
  if (/^border/.test(base)) return `${variant}border`;
  if (/^opacity-/.test(base)) return `${variant}opacity`;
  if (/^transition/.test(base)) return `${variant}transition`;
  return undefined;
}

export function cn(...inputs: ClassValue[]): string {
  const tokens: string[] = [];
  flatten(inputs, tokens);

  const latestByGroup = new Map<string, number>();
  const result: string[] = [];

  for (const token of tokens) {
    if (!token) continue;

    const group = conflictGroup(token);
    if (group) {
      const previous = latestByGroup.get(group);
      if (previous !== undefined) result[previous] = "";
    }

    latestByGroup.set(group ?? `unique-${result.length}`, result.length);
    result.push(token);
  }

  return result.filter(Boolean).join(" ");
}
