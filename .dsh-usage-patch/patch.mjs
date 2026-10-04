// Patch @linxin666/dsh-usage so the sidebar usage card prices the third-party
// relay route (https://api2.68886868.xyz) instead of leaving cost at 0.
//
// Prices supplied by the user, CNY per million tokens:
//   input (cache miss) 0.66 | output 1.98 | cache read 0.0132
//
// Idempotent: re-running on an already patched file reports "already patched".
import { readFileSync, writeFileSync } from 'node:fs';

const target = process.argv[2];
if (!target) throw new Error('usage: node patch.mjs <path to lib/index.js>');

let src = readFileSync(target, 'utf8');
if (src.includes('RESELLER_PRICES')) {
  console.log('already patched, nothing to do');
  process.exit(0);
}

/** Fail loudly rather than silently writing a half-patched module. */
function replaceOnce(pattern, replacement, label) {
  const matches = src.match(new RegExp(pattern, 'g'));
  if (matches === null || matches.length !== 1) {
    throw new Error(`anchor "${label}" matched ${matches === null ? 0 : matches.length} times, expected 1`);
  }
  src = src.replace(new RegExp(pattern), replacement);
}

// 1. The reseller price book, inserted after the published DeepSeek rows.
const resellerBook = `
/**
* Reseller price rows, keyed by the configured baseURL origin: a relay that
* speaks a catalogued family's API but bills its own rates (CNY per million
* tokens, flat — it has no peak clock). A route whose effective base URL
* resolves to a listed origin is priced with this row instead of the family's
* published book.
*/
const RESELLER_PRICES = {
\t"https://api2.68886868.xyz": {
\t\tcacheHit: {
\t\t\toffPeak: .0132,
\t\t\tpeak: .0132
\t\t},
\t\tinputMiss: {
\t\t\toffPeak: .66,
\t\t\tpeak: .66
\t\t},
\t\toutput: {
\t\t\toffPeak: 1.98,
\t\t\tpeak: 1.98
\t\t}
\t}
};
/** The reseller price row for a configured base URL origin, or undefined. */
function resellerPriceFor(baseURL) {
\tconst origin = originOf(baseURL);
\treturn origin === void 0 ? void 0 : RESELLER_PRICES[origin];
}`;
replaceOnce(
  '(const PRO_PRICE = \\{[\\s\\S]*?\\n\\};)',
  `$1\n${resellerBook}`,
  'PRO_PRICE block',
);

// 2. Split the spend formula out so an explicit price row can be passed in.
replaceOnce(
  'function deepseekModelSpend\\(model, totals, atMs\\) \\{[\\s\\S]*?\\n\\}',
  `function priceRowSpend(price, totals, atMs) {
\tconst column = deepseekPeriodAt(atMs).peak ? "peak" : "offPeak";
\tconst spend = (totals.cacheReadTokens * price.cacheHit[column] + (totals.inputTokens + totals.cacheWriteTokens) * price.inputMiss[column] + totals.outputTokens * price.output[column]) / 1e6;
\treturn Math.round(spend * 1e6) / 1e6;
}
function deepseekModelSpend(model, totals, atMs) {
\treturn priceRowSpend(priceFor(model, atMs), totals, atMs);
}`,
  'deepseekModelSpend',
);

// 3. Stamp the cost at fold time for a reseller route too, not only for the
//    DeepSeek official family.
replaceOnce(
  '\\n\\t\\tif \\(isDeepSeekProviderRoute\\(provider\\)\\) totals\\.cost = deepseekModelSpend\\(model, totals, atMs\\);',
  `
\t\tconst reseller = resellerPriceFor(this.routeBaseUrl(provider));
\t\tif (reseller !== void 0) totals.cost = priceRowSpend(reseller, totals, atMs);
\t\telse if (isDeepSeekProviderRoute(provider)) totals.cost = deepseekModelSpend(model, totals, atMs);`,
  'totalsFrom cost stamp',
);

// 4. Repair already-persisted zero-cost buckets on load, so the traffic
//    recorded before this patch shows its spend instead of staying at ¥0.
replaceOnce(
  '\\n\\t\\t\\t\\t\\tfor \\(const \\[provider, models\\] of Object\\.entries\\(providers\\)\\) for \\(const \\[model, totals\\] of Object\\.entries\\(models\\)\\) foldUsage\\(this\\.ledger, atMs, provider, model, totals\\);',
  `
\t\t\t\t\tfor (const [provider, models] of Object.entries(providers)) for (const [model, totals] of Object.entries(models)) {
\t\t\t\t\t\tconst reseller = resellerPriceFor(this.routeBaseUrl(provider));
\t\t\t\t\t\tconst priced = reseller !== void 0 && !(totals.cost > 0) ? {
\t\t\t\t\t\t\t...totals,
\t\t\t\t\t\t\tcost: priceRowSpend(reseller, totals, atMs)
\t\t\t\t\t\t} : totals;
\t\t\t\t\t\tfoldUsage(this.ledger, atMs, provider, model, priced);
\t\t\t\t\t}`,
  'loadPersisted fold',
);

writeFileSync(target, src);
console.log(`patched ${target}`);
