// Verify the patched pricing region in isolation: extract it from the patched
// module and price today's already-recorded tokens, so we know the card's
// number is right before the host is restarted.
import { readFileSync } from 'node:fs';

const target = process.argv[2];
const src = readFileSync(target, 'utf8');

const originOf = src.match(/function originOf\(baseURL\) \{[\s\S]*?\n\}/)[0];
const region = src.slice(
  src.indexOf('//#region src/core/pricing.ts'),
  src.indexOf('//#endregion', src.indexOf('//#region src/core/pricing.ts')),
);
const api = new Function(`${originOf}\n${region}\nreturn { priceRowSpend, resellerPriceFor, deepseekModelSpend };`)();

const RELAY = 'https://api2.68886868.xyz';
const today = {
  inputTokens: 38774,
  outputTokens: 4180,
  cacheReadTokens: 509312,
  cacheWriteTokens: 0,
};

const checks = [];
const row = api.resellerPriceFor(`${RELAY}/v1`);
checks.push(['relay baseURL resolves to a price row', row !== undefined]);
checks.push(['official DeepSeek baseURL stays unpriced', api.resellerPriceFor('https://api.deepseek.com') === undefined]);
checks.push(['no baseURL resolves to nothing', api.resellerPriceFor(undefined) === undefined]);

const at = Date.parse('2026-10-04T12:00:00');
const cost = api.priceRowSpend(row, today, at);
const expected = (today.cacheReadTokens * 0.0132 + (today.inputTokens + today.cacheWriteTokens) * 0.66 + today.outputTokens * 1.98) / 1e6;
checks.push([`today's 17 calls price to ${cost} CNY`, Math.abs(cost - Math.round(expected * 1e6) / 1e6) < 1e-9]);

// The relay row must be flat: peak and off-peak columns identical.
checks.push(['relay row is flat across the peak clock', row.output.peak === row.output.offPeak && row.inputMiss.peak === row.inputMiss.offPeak]);

// The published official rows must be untouched.
const official = api.deepseekModelSpend('deepseek-v4-pro', today, Date.parse('2026-08-01T04:00:00'));
checks.push([`official v4-pro row still prices pre-fold traffic (${official})`, official > 0]);

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
}
console.log(`\n今日 17 次调用 = ¥${cost.toFixed(4)}  (卡片显示 ¥${cost.toFixed(2)})`);
process.exit(failed === 0 ? 0 : 1);
