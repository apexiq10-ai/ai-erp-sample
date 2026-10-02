// Copy integrity check.
// 1. Every string in src/content.ts must appear in COPY.md, the approved copy
//    deck (case-insensitive; curly quotes, markdown emphasis and whitespace
//    normalised), unless it is system language listed below.
// 2. No em or en dashes anywhere in src/, COPY.md or the exported page.
// 3. Claim discipline: banned phrases may not appear in src/ outside the A6
//    "We never say" list.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const deck = readFileSync(path.resolve(root, "COPY.md"), "utf8");
const content = readFileSync(path.resolve(root, "src/content.ts"), "utf8");

const norm = (t) =>
  t
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\\"/g, '"')
    .replace(/\*\*|`/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

const corpus = norm(deck);

// System language: ids, modes and labels that are not narrative copy.
const SYSTEM = new Set(
  ["night", "paper", "main", "appendix", "apx", "all", "decision", "High", "Medium", "Low"].map(norm),
);

const strings = [...content.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
const misses = [];
for (const raw of strings) {
  const s = norm(raw);
  if (s.length < 3 || !/[a-z]/.test(s)) continue;
  if (/^(s\d\d|a\d|[a-z]\d)$/.test(s)) continue;
  if (SYSTEM.has(s)) continue;
  if (corpus.includes(s)) continue;
  misses.push(raw);
}

// dash scan + claim discipline
const BANNED = [
  /audit[- ]ready/i, /audit[- ]proof/i, /zero[- ]day close/i, /autonomous accounting/i, /no accountants needed/i,
  /replace (your|the) accounting team/i, /ai[- ]powered/i, /seamless/i, /superintelligence/i, /\bharness\b/i,
  /nightmare/i, // never in our marketing
];
const ALLOW = [/never: \[/, /is the direction, not the promise/, /BANNED|ALLOW/];
const dashHits = [];
const claimHits = [];
const scan = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) scan(p);
    else if (/\.(tsx?|css|html|md|mjs)$/.test(f)) {
      readFileSync(p, "utf8")
        .split("\n")
        .forEach((line, i) => {
          const at = `${path.relative(root, p)}:${i + 1}`;
          if (/[—–]/.test(line)) dashHits.push(at);
          if (p.includes("/src/") && !ALLOW.some((a) => a.test(line)) && BANNED.some((b) => b.test(line))) claimHits.push(at);
        });
    }
  }
};
scan(path.join(root, "src"));
if (/[—–]/.test(deck)) dashHits.push("COPY.md");
// Words that must never reach our marketing, anywhere: deck, source or page.
const NEVER = [/nightmare/i];
const neverIn = (label, text) => NEVER.forEach((w) => w.test(text) && claimHits.push(`${label} (${w.source})`));
neverIn("COPY.md", deck);
if (existsSync(path.join(root, "out/index.html"))) {
  const html = readFileSync(path.join(root, "out/index.html"), "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
  if (/[—–]/.test(html)) dashHits.push("out/index.html (rendered markup)");
  neverIn("out/index.html", html);
}

console.log(`Checked ${strings.length} strings from content.ts against COPY.md.`);
if (misses.length) {
  console.log(`\nNot found verbatim in COPY.md (${misses.length}):`);
  misses.forEach((m) => console.log("  · " + m));
} else console.log("All narrative strings match the copy deck.");
if (dashHits.length) {
  console.log(`\nEm/en dashes found:`);
  dashHits.forEach((d) => console.log("  · " + d));
} else console.log("No em or en dashes in src/, COPY.md or the exported page.");
if (claimHits.length) {
  console.log(`\nClaim discipline violations:`);
  claimHits.forEach((d) => console.log("  · " + d));
} else console.log("Claim discipline holds.");
process.exit(misses.length || dashHits.length || claimHits.length ? 1 : 0);
