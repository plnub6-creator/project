# 当前状态（STATE）

> 这个文件是「现在」，不是历史：**每次会话收尾就覆盖它**，不要往下堆。
> 历史与因果在 [DECISIONS.md](DECISIONS.md)，教训在 [LESSONS.md](LESSONS.md)。

**更新于**：2026-10-04（Asia/Shanghai，会话中断前）

## 待办：下次接手第一件事

1. **重启 `dsh web`**（用户自己手动做）。一次带走两件事：
   - `@linxin666/dsh-usage` 的中转价格补丁生效 → 侧边栏「用量」卡片的今日消费应显示约 **¥0.04**
     （历史那 17 次会在载入账本时自动补算，不依赖关机顺序）
   - Hindsight 的 `disabled: true` 生效 → 不再每轮 401 空转
2. **重启后验证**：卡片有金额 = 补丁成功；`~/.hindsight/coding-agents-logs/diag.jsonl` 不再新增 = Hindsight 已停。
   若卡片仍无金额，回 [.dsh-usage-patch/README.md](../.dsh-usage-patch/README.md) 重放补丁。
3. **GraphFlow 未修**：没跑 `graphflow deps install`（要装原生 better-sqlite3，可能得现场编译）。
   现状是 JSON 回退，每次合并丢边，但功能可用。用户暂不要求修。

## 环境现状

- **用量价格表**：补丁已在磁盘
  `~/.dsh/profiles/web/node_modules/@linxin666/dsh-usage/lib/index.js`；
  重放脚本 / 校验 / 原始备份 / diff 在 [.dsh-usage-patch/](../.dsh-usage-patch/)（提交 `98eec6f`）。
  **插件升级会覆盖它**，升级后要重放。
- **Hindsight**：已按用户选择**关闭**。配置 `~/.hindsight/coding-agent.json` = `{"disabled": true}`
  （此前没有这个文件，走内置默认 `false`）。恢复办法：删掉该文件或改成 `false`，然后重启 DSH
  （`disabled` 不是热加载字段）。代价：5 个知识页不会生成，`hindsight_*` 工具不可用。
- **灵枢**（`@furongjun1999/dsh-memory`）：在跑，本机 md 图在 `~/.dsh/.dsh-memory/data/mdcg`；
  12 个节点全在 `contextual` 层，`knowledge` / `hippocampus` / `anchor` / `goals` 均为空。
- **DSH**：`0.2.0-rc.2`（= npm 最新）。profile 目录 `~/.dsh/profiles/web`。

## 已知行为

- **中途插话会排队**：我在跑的时候用户发消息，消息不打断我，要等本轮结束才送达。
  这是会话最早「发"你好"没回」的真实原因（当时我正在跑）。用户已知悉，别再当成断线排查。

## 别再重复做的事

- 不要重新深审已装的第三方插件（用户信任其来源；规则见 AGENTS.md）。
- 不要"顺手"重装 `dsh-vault`（已是 1.10.74 最新）；不要逐个核对第三方插件更新（用户裁定保持现状）。
- 不要建议 crontab / systemd / CI 之类系统级定时，定时任务用 `automation_create`。
