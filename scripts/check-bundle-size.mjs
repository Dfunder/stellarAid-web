// Fails when the client JS in .next/static/chunks exceeds the budget below.
// Run after `next build`. To raise a budget deliberately, edit the constants
// in this file in the same PR and explain why.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET = {
  totalGzipKB: 600, // all client JS chunks combined
  chunkGzipKB: 200, // any single chunk
};
const TOLERANCE = 0.05;
const dir = ".next/static/chunks";

const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".js") ? [p] : [];
  });

const kb = (n) => n / 1024;
const sizes = walk(dir).map((p) => [p, kb(gzipSync(readFileSync(p)).length)]);
const total = sizes.reduce((a, [, s]) => a + s, 0);
const errors = [];

const limit = (b) => b * (1 + TOLERANCE);
if (total > limit(BUDGET.totalGzipKB))
  errors.push(`total: ${total.toFixed(1)} KB gz, budget ${BUDGET.totalGzipKB} KB (+${(total - BUDGET.totalGzipKB).toFixed(1)} KB)`);
for (const [p, s] of sizes)
  if (s > limit(BUDGET.chunkGzipKB))
    errors.push(`${p}: ${s.toFixed(1)} KB gz, budget ${BUDGET.chunkGzipKB} KB (+${(s - BUDGET.chunkGzipKB).toFixed(1)} KB)`);

console.log(`Client JS: ${total.toFixed(1)} KB gzip across ${sizes.length} chunks`);
if (errors.length) {
  console.error("Bundle budget exceeded:\n" + errors.join("\n"));
  process.exit(1);
}
