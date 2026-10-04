# 踩坑记录（LESSONS）

> 用途：**可复用的教训**。每条写清「现象 → 原因 → 下次怎么做」。
> 判据：下次遇到同类现象时，这条能让我少走一遍弯路，否则不该留在这里。

## 插件价格表硬编码，找不到配置项先看 schema

- **现象**：GUI 用量卡片「今日消费」恒为 0，翻遍设置页找不到价格配置。
- **原因**：价格写死在插件 `lib/index.js` 的常量里；配置 schema 只有 3 个字段。
- **下次**：先读插件的 `Config = z.object({...})` 和 `lib/types/`，确认「有没有这个开关」，
  再决定是改配置还是打补丁。别先翻 UI。

## 改 node_modules 前先断开 pnpm 硬链接

- **现象**：直接编辑 `~/.dsh/profiles/web/node_modules/<pkg>/lib/index.js` 有风险。
- **原因**：pnpm 从全局 store 硬链接文件（`stat` 显示 link count 2），原地写会连带改到 store 里的共享副本。
- **下次**：`cp x.js x.js.tmp && mv -f x.js.tmp x.js` 换成新 inode（link count 变 1）再编辑；改前先备份原文件。

## 沙箱内 npm / pnpm 写不了缓存

- **现象**：`npm view` 报 `EROFS: ... '/home/lu/.npm/_cacache/tmp/...'`。
- **原因**：会话工作区是 `/home/lu/code/myproject`，`~/.npm`、`~/.dsh` 都在工作区外，workspace-write 模式下只读。
- **下次**：只是查版本号就用 `web_fetch` 拉 `https://registry.npmjs.org/<pkg>/latest`，不必跑 npm；
  真要装包/改 `~/.dsh` 时，说明理由后一次性申请提权，别反复试。

## 会话启动时 dsh 会重写 profile 的 cordis.yml

- **现象**：`dsh web --help` 报 `EROFS ... profiles/web/cordis.yml`（沙箱内）。
- **原因**：启动 profile 时会写组合文件，属正常行为，不是配置坏了。
- **下次**：在沙箱里别用「跑一次 dsh 子命令」来探查 profile；直接读 `cordis.patch.yml` / `package.json`。

## 用户给的规则常是「面向未来」的，别把它变成对存量的动作

- **现象**：用户说"你以后想加点别的东西进来要注意安全"，我立刻回头把已装的 20 个插件审了一遍，
  还顺手把规则往"轻"的方向改了。
- **原因**：把"约束我接下来的动作"理解成了"修补过去的状态"，方向反了——该收窄的是**范围**，不是**强度**。
  多做一轮事小，把规则记错才是真问题。
- **下次**：听到规则类的话，先分清它约束的是「我下一步要做的」还是「已经存在的东西」；
  分不清就问一句，别自己扩大成一次清理动作。

## 插件审查：先看三个信号，再看上下文

- **现象**：想知道一个第三方插件有没有风险，但包内几百个文件看不过来。
- **原因**：真实风险高度集中，绝大多数命中都是正常的。
- **下次**：按这个顺序——① `package.json` 里的 `preinstall` / `install` / `postinstall` / `prepare`
  （**安装即执行代码**，最该看）② 是否命中 `.credentials.yaml` 等凭据路径（是就确认它"应该"碰凭据）
  ③ 搜 `child_process` / `eval` / `new Function`，然后**读它的上下文**：命中的多半是自更新、起子进程、
  跑构建，不是后门。别只看计数就下结论。
- **工具**：`.plugin-audit/scan.mjs` 一条命令扫完直接依赖，输出"需要人看的"和"其余"两栏。

## Hindsight 没配 key 时是"静默无记忆"

- **现象**：记忆工具全部 401，但界面看起来一切正常。
- **原因**：`~/.hindsight/coding-agent.json` 不存在、无 `HINDSIGHT_API_TOKEN`，请求不带 Authorization。
- **下次**：怀疑记忆没生效时，先看 `~/.hindsight/coding-agents-logs/diag.jsonl` 与 `plugin.log`；
  出现 `reflect failed — session runs without memory` 就是这条路根本没通。

## IM 频道会话不能从网页新建

- **现象**：网页「频道」页签里找不到"新建对话"。
- **原因**：设计如此——IM 会话只在频道页签回看/接续，新建入口在 IM 端。
- **下次**：在 IM 里发 `/new` 或 `/clear`；`/menu` 也有「新会话」按钮。
