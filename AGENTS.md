<!-- GRAPHFLOW:BEGIN managed block — edit outside these markers only -->
# GraphFlow for Claude Code

Use GraphFlow as a local orchestration and context service.

## Recommended setup

Add a local MCP server entry that launches GraphFlow over stdio:

```json
{
  "mcpServers": {
    "graphflow": {
      "command": "npx",
      "args": ["-y", "--package=@roarpeng/graphflow", "graphflow-mcp"]
    }
  }
}
```

During repository development you can also point Claude Code at this checkout:

```json
{
  "mcpServers": {
    "graphflow": {
      "command": "npm",
      "args": ["run", "start:mcp"],
      "cwd": "."
    }
  }
}
```

## Usage guidance

- Ask GraphFlow to plan before broad changes: `graphflow_plan`.
- Ask GraphFlow to compress and anchor code context: `graphflow_context`.
- Always pass `rootDir` = this project's absolute path. **Never** pass your home directory, AppData, or an unexpanded `${workspaceFolder}` placeholder — GraphFlow refuses unsafe workspace roots. If a call answers `unsafe workspace root`, retry the same call without `rootDir` (the server then uses its configured workspace).
- Ask GraphFlow to inspect graph state or skill learnings when the repo history matters.
- After executing work from a `graphflow_run` `executionDescriptor`, **must** call `graphflow_report_outcome` with the `episodeId` from the run result, a `success` boolean, and optional `lessons` to close the skill flywheel loop.
- Fall back to `graphflow ... --json` only if MCP is not available (including `graphflow --json outcome report <episodeId> <success>`).

DeepSeek Harness: `dsh plugin --profile web add @roarpeng/graphflow` (or `npx @roarpeng/graphflow install` when `~/.dsh` exists).
<!-- GRAPHFLOW:END -->

# 记忆约定（本项目）

跨会话记忆以**仓库内文件 + 本机记忆库**为准；默认不启用任何会把代码或对话送出本机的集成。

## 开工前先读

- [docs/memory/DECISIONS.md](docs/memory/DECISIONS.md) —— 已经定过什么、为什么、什么条件下重新考虑。动手前先查，避免把定过的事重新翻案。
- [docs/memory/LESSONS.md](docs/memory/LESSONS.md) —— 可复用的踩坑教训（插件硬编码、沙箱限制等）。遇到同类现象先查这里。
- 要改本机 DSH 配置或 `node_modules` 时，[.dsh-usage-patch/README.md](.dsh-usage-patch/README.md) 是先例与重放方式。

## 收尾时写回

任务结束前问一句：这次的东西"下次还会用到"吗？

- 决策 / 因果 → 追加到 `DECISIONS.md`；推翻旧条目时改成「已被 #### 取代」并链到新条目，不要删。
- 教训 → 追加到 `LESSONS.md`，写成「现象 → 原因 → 下次怎么做」。
- 只是过程细节（改过哪几行）→ 不写，git 里有。

## 拿不准就问

用户明确说过：实在拿不准的时候，直接和他说一声。

- **先问再动**：可能动到「已经存在的东西」（清理、迁移、改存量）；要引入新依赖 / 新插件 / 外部服务；
  任何需要提权的写操作；分不清指令约束的是「我下一步要做的」还是「已有的状态」。
- **不必问**：只读操作、可逆的小改动、明确在用户给出范围内的事 —— 自己做，然后说清做了什么。
- **判断标准**：做错了要花他时间善后 → 先问；做错了只是重来一次 → 自己决定。

## 数据安全红线

- **我今后要新增插件 / 技能 / MCP 时**：先做轻量审查——看包名 / 发布者 / 仓库，扫一眼 `package.json`
  有没有 `preinstall` / `install` / `postinstall` / `prepare`（安装即执行代码的地方），是否碰
  `.credentials.yaml` 之类凭据路径，以及它**会把什么数据发到哪里**；然后**先说清、征得同意再装**。
  来路不明的（没仓库、下载量极低、代码混淆）不装；要深查用 `.plugin-audit/scan.mjs`。
- **已装的插件与技能**：用户信任其来源（多为高星常用件），**不主动深审**，有具体疑点再查。
- 不把 `~/.dsh` 下的凭据、会话原文、令牌写进记忆文件或提交。
- 不擅自启用会把本机数据发往第三方的集成（云记忆、云端 LLM 提取等）；要开先问用户。
- 装或改任何插件前，先说清「它会把什么数据发到哪里」。
- 工作与私人分区：记忆库按仓库分 bank；私人内容不进工作仓库，反之亦然。
