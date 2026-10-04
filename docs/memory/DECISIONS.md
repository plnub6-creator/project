# 决策记录（DECISIONS）

> 用途：跨会话的"为什么"。每条都要能被下一次会话直接读懂——不写"改了什么"（那是 git 的事），
> 只写**定下了什么、为什么、什么条件下要重新考虑**。
> 维护方式：任务收尾时追加；推翻旧结论时不要删，改成「已被 #### 取代」并链到新条目。

## 2026-10-04 · GUI 用量卡片接入中转站价格

- **定下**：`@linxin666/dsh-usage` 的价格表是硬编码的，且只对路由键 `deepseek` / `deepseek-official` 生效；
  配置 schema 只有 `enabled` / `pollIntervalSec` / `retainDays`，**没有任何价格入口**（npm 最新版 0.4.4 同样如此）。
  因此第三方中转（provider `xiaoji`，baseURL `https://api2.68886868.xyz`）的 `cost` 恒为 0。
- **做法**：给插件打补丁，新增按 **baseURL origin** 匹配的价格表 `RESELLER_PRICES`，
  价格 ¥0.66 输入 / ¥1.98 输出 / ¥0.0132 缓存读（每百万 token，平铺无高峰），
  并在载入旧账本时给「可算但 cost 仍为 0」的桶补算。
- **为什么按 origin 而不是按 provider 名**：profile 里两条路由（`xiaoji` 与 `deepseek-official`）都指向同一个中转；
  按 origin 匹配一次覆盖两条，且 baseURL 改回官方 `api.deepseek.com` 时自动回到官方价格表，不会误算。
- **代价**：补丁位于 `node_modules`，插件升级即失效。
  重放与校验脚本、原始文件备份、统一 diff 都在 [.dsh-usage-patch/](.dsh-usage-patch/)（提交 `98eec6f`）。
- **重新考虑的条件**：插件上游新增价格配置项；或不再走该中转。

## 2026-10-04 · 不重装 dsh-vault

- **定下**：`dsh-vault` 已经是 1.10.74（npm 最新），且已在 profile 的 `bundles` 里、`cordis.patch.yml` 插了 `vault` 行。
- **为什么**：用户给的包名 `@deepseek-ai/dsh-plugin-vault` 在 npm 上不存在（该 scope 下也没有 `dsh-vault`），
  真实包名是 `dsh-vault`（作者 Ox0400）。已装即最新，无需动作。

## 2026-10-04 · 第三方插件不做版本核对

- **定下**：profile 里的第三方插件（`@michengai/*`、`@roarpeng/graphflow`、`dsh-pocket`、`@linxin666/dsh-web-all` 等）
  暂不逐个核对更新。
- **为什么**：用户判断「保持现状最稳」。DSH 本体 `0.2.0-rc.2`、`dsh-vault`、`dsh-usage` 已核对为最新。

## 2026-10-04 · 审查强度降级为「轻量检查」（用户裁定）

- **定下**：用户认为已装的插件与技能「星比较高」、愿意信任，明确表示**不需要逐个深审**。
  因此 AGENTS.md 的插件红线降级为 30 秒轻量检查（看安装钩子、看是否碰凭据、看来路是否明）；
  `.plugin-audit/scan.mjs` 保留为"要深查时"用的工具，不默认跑。
- **为什么**：审查强度应该由用户的风险偏好决定，而不是我的偏好；写下来，免得下次会话又自动上强度。
- **用户已知悉**：星数反映受欢迎程度，不反映"这次更新加了什么"——典型风险是高星包在某次更新里
  新增安装钩子，而非新包本身可疑。用户接受这个风险。

## 2026-10-04 · 已装插件安全体检：无恶意，但 4 个有"能力"需知情

- **定下**：对 profile 的 20 个直接依赖做了一轮静态体检（安装钩子 / 凭据路径 / 执行类调用 / 人工看上下文），
  **未发现恶意或混淆代码**。以下是安装期或运行期**确实有动作**的，属知情项而非隐患：
  - `@furongjun1999/dsh-memory`（灵枢）`prepare`：安装时 `rmSync('lib')` 再重建 —— 自构建步骤。
  - `@roarpeng/graphflow` `postinstall`：往 home 写 skill/rules/MCP 配置、调自己的 CLI 安装器，**无网络请求**。
  - `dsh-free-search`：读写 `~/.dsh/.credentials.yaml` 是设计（存各家搜索 key）；唯一的 `exec` 是自我更新
    `pnpm add dsh-free-search@latest` —— 即**它能在本机安装包**。
  - `dsh-vault`：22 处凭据路径命中，是它的职责本身；但它是这套里**权限最敏感**的一个（能读写全部凭据）。
- **为什么记下来**：用户的主要顾虑正是"第三方插件/技能代码有风险"。结论是当前这套可以留，
  但以后每加一个都要先审（见 AGENTS.md 红线，方法见 LESSONS.md）。
- **重新考虑的条件**：任何插件发新版本后想升级时 —— 升级等于重新执行它的安装钩子。

## 2026-10-04 · 记忆策略：本地优先

- **定下**：跨会话记忆以**本地文件 + 本地记忆库**为主，不启用会把本机代码或对话送出机器的集成。
- **为什么**：见 [LESSONS.md](LESSONS.md) 中 Hindsight 无 key 空转一节；
  云记忆意味着把仓库内容与会话原文发给第三方。要开云必须先经用户明确同意。
