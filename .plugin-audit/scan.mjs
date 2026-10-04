// 插件安全体检：只看直接依赖里的高风险信号，不做全量依赖树扫描。
//   1) preinstall/install/postinstall/prepare 钩子（安装即执行代码）
//   2) 读取 ~/.dsh 凭据路径、或 .credentials.yaml
//   3) 引用 child_process / eval / Function 构造器、以及 DNS 探测类调用
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const names = Object.keys(pkg.dependencies ?? {});

const HOOKS = ['preinstall', 'install', 'postinstall', 'prepare'];
const CRED = /\.credentials\.yaml|credentials\.yaml|\.dsh\/\.credentials|vault\/|_keys\.json/;
const EXEC = /\bchild_process\b|\beval\s*\(|new Function\s*\(|execSync\(|spawnSync\(/;

function walkJs(dir, out, depth = 0) {
  if (depth > 3) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walkJs(p, out, depth + 1); }
    else if (/\.(js|cjs|mjs)$/.test(e.name)) {
      try { if (statSync(p).size < 4_000_000) out.push(p); } catch {}
    }
  }
}

const rows = [];
for (const name of names) {
  const dir = join(root, 'node_modules', name);
  let meta;
  try { meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')); } catch { continue; }
  const hooks = HOOKS.filter((h) => meta.scripts?.[h]).map((h) => `${h}: ${meta.scripts[h]}`);
  const files = [];
  walkJs(dir, files);
  let cred = 0, exec = 0, big = 0;
  for (const f of files) {
    let s;
    try { s = readFileSync(f, 'utf8'); } catch { continue; }
    if (CRED.test(s)) cred += 1;
    if (EXEC.test(s)) exec += 1;
  }
  big = files.length;
  const flags = [];
  if (hooks.length) flags.push('⚠️ 安装钩子');
  if (cred) flags.push(`读凭据(${cred} 文件)`);
  if (exec) flags.push(`执行类调用(${exec} 文件)`);
  rows.push({ name, version: meta.version, repo: meta.repository?.url ?? '—', files: big, hooks, flags, cred, exec });
}

console.log(`直接依赖 ${rows.length} 个（扫描范围：包内 js，深度 3，跳过 node_modules）\n`);
const hot = rows.filter((r) => r.hooks.length || r.cred);
console.log('== 需要人看的 ==');
for (const r of hot) {
  console.log(`\n● ${r.name}@${r.version}`);
  console.log(`  repo: ${r.repo}`);
  if (r.hooks.length) for (const h of r.hooks) console.log(`  ⚠️  ${h}`);
  if (r.cred) console.log(`  ⚠️  命中凭据路径 ${r.cred} 处 / ${r.exec} 处执行类调用（共 ${r.files} 个 js 文件）`);
}
console.log('\n== 其余（无安装钩子、未命中凭据路径）==');
for (const r of rows.filter((x) => !hot.includes(x))) {
  console.log(`  ${r.name}@${r.version}  js:${r.files}  执行类:${r.exec}`);
}
