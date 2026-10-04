# 当前状态（STATE）

> 这个文件是「现在」，不是历史：**每次会话收尾就覆盖它**，不要往下堆。
> 历史与因果在 [DECISIONS.md](DECISIONS.md)，教训在 [LESSONS.md](LESSONS.md)。

**更新于**：2026-10-04 15:29（Asia/Shanghai）

## 当前语境（接手先读这一行）

- 用户刚在 **IM 端新建了一个会话**并确认建立成功。他之前那句「嗯……成功了吗」问的是**这件事**，
  不是下面的待办清单——我当时按待办去猜，猜错了（教训见 [LESSONS.md](LESSONS.md)「主语不明的短问句」）。
- **下次遇到没有主语的短问句：先回一句猜测 + 询问，别拿 STATE 的待办去补全。**

## 待办

1. **用量价格补丁：已确认生效，可以收工。**
   - `verify.mjs` 6/6 PASS；账本 `~/.dsh/dsh-usage/usage-ledger.json` 今日 `xiaoji` 路由
     `cost = 0.697993`（112 次调用），与补丁公式逐项吻合（输入 0.36126 + 输出 0.19167 + 缓存读 0.14499）。
   - → 侧边栏「用量」卡片今日应显示 **≈¥0.70**。
     **别再拿 ¥0.04 去对照**——那是最初只有 17 次调用时的预估，已过期。
2. **Hindsight 关闭：仍未确证，别当成结论。**
   - 配置已落盘：`~/.hindsight/coding-agent.json` = `{"disabled": true}`（15:08 写入）。
   - 开关本身有效：`dist/dsh.js` 里 `if (cfg.disabled)` 会直接停掉整个 workspace
     （inject / reflect / pages / retain 全停）。
   - 但 15:22 的 `diag.jsonl` 仍在写 401 → 该配置**可能还没被加载**（要宿主在 15:08 之后重启过才生效）。
     这是**旁证推断，未确证**；我上一轮差点把它当结论让用户再重启一次，已撤回。
   - 验证方式：重启后 `wc -l ~/.hindsight/coding-agents-logs/diag.jsonl` 不再增长。
     若用户确认已重启而仍在写 401，再另找原因，**不要直接归因「你没重启」**。
3. **GraphFlow 未修**：没跑 `graphflow deps install`（要装原生 better-sqlite3，可能得现场编译）。
   现状是 JSON 回退，每次合并丢边，但功能可用。用户暂不要求修。

## 环境现状

- **用量价格表**：补丁已在磁盘
  `~/.dsh/profiles/web/node_modules/@linxin666/dsh-usage/lib/index.js`；
  重放脚本 / 校验 / 原始备份 / diff 在 [.dsh-usage-patch/](../.dsh-usage-patch/)（提交 `98eec6f`）。
  **插件升级会覆盖它**，升级后要重放。
- **Hindsight**：已按用户选择关闭（配置文件见上）。恢复办法：删掉该文件或改成 `false`，然后重启 DSH
  （`disabled` 不是热加载字段）。代价：5 个知识页不会生成，`hindsight_*` 工具不可用。
- **灵枢**（`@furongjun1999/dsh-memory`）：在跑，本机 md 图在 `~/.dsh/.dsh-memory/data/mdcg`；
  12 个节点全在 `contextual` 层，`knowledge` / `hippocampus` / `anchor` / `goals` 均为空。
- **DSH**：`0.2.0-rc.2`（= npm 最新）。profile 目录 `~/.dsh/profiles/web`。
  14:40–14:45 期间装过插件（新增 `@yejiming/dsh-gomoku`，hindsight 的 `dist/` 被重写）——
  是那段时间的插件安装动作，不是异常。

## 已知行为

- **中途插话会排队**：我在跑的时候用户发消息，消息不打断我，要等本轮结束才送达。
  这是会话最早「发"你好"没回」的真实原因（当时我正在跑）。用户已知悉，别再当成断线排查。
  反过来说：**别长时间静默地挖**，看起来就像卡死。
- **沙箱里看不到宿主进程**：命令跑在 `bwrap --unshare-pid` 里，`/proc` 是沙箱自己的，
  `ps -ef` / `pgrep` 只看得到沙箱那几条进程。想判断宿主是否重启过，**别用 ps**；
  只能拿它写过的文件（`~/.dsh/logs/lingshu-bridge-debug.log`、各目录 mtime）当**旁证**。

## 别再重复做的事

- 不要重新深审已装的第三方插件（用户信任其来源；规则见 AGENTS.md）。
- 不要"顺手"重装 `dsh-vault`（已是 1.10.74 最新）；不要逐个核对第三方插件更新（用户裁定保持现状）。
- 不要建议 crontab / systemd / CI 之类系统级定时，定时任务用 `automation_create`。
- **不要为一句没有主语的短问句去挖插件内部**（见 LESSONS「主语不明的短问句：先问，别考古」）。
