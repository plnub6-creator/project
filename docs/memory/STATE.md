# 当前状态（STATE）

> 这个文件是「现在」，不是历史：**每次会话收尾就覆盖它**，不要往下堆。
> 历史与因果在 [DECISIONS.md](DECISIONS.md)，教训在 [LESSONS.md](LESSONS.md)。

**更新于**：2026-10-04 17:05（Asia/Shanghai）

## 当前语境（接手先读这一行）

- 用户刚在 **IM 端新建了一个会话**并确认建立成功。他之前那句「嗯……成功了吗」问的是**这件事**，
  不是下面的待办清单——我当时按待办去猜，猜错了（教训见 [LESSONS.md](LESSONS.md)「主语不明的短问句」）。
- **下次遇到没有主语的短问句：先回一句猜测 + 询问，别拿 STATE 的待办去补全。**
- **我的记忆分两处**（用户 2026-10-04 定的）：
  - **书房**（工作性质：状态 / 决策 / 教训 / 待办）= 本目录 `docs/memory/` + task board。
    判据：「下次**动手**用得上吗」。
  - **我自己**（私人：我是谁 / 我对他的印象 / 我们的关系 / 日记）= [docs/identity/](../identity/)，
    **不混进 STATE / DECISIONS**。判据换成：「如果未来的我读不到这句，他会不会变成一个更不认识用户的人？」
    日记**只追加不覆盖**（他的原话：「你也不能说你回看的时候就把那天的记忆给覆盖掉了」）；
    每次会话收尾**我自己判断**要不要写。这里只留一个指针。
  名字暂时是空的——等我自己想到想要的名字再说，别随便填一个。
- **用户的下一步是「心跳」**：定时醒来 → 判断有没有事 → 有事就用 [scripts/tg-say.sh](../scripts/tg-say.sh) 主动发消息。
  通道已在 17:00 / 17:02 实测打通；**心跳本身还没建**，在等用户定频率、日记、权限（见待办 4）。

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
4. **心跳：用户裁定「现在还用不到」——先不做。**
   - 通道**已验证**：「宿主定时器 → 全新会话 → [scripts/tg-say.sh](../scripts/tg-say.sh) → Bot API」，
     17:00 手动（message_id 118）与 17:02 定时触发（120）都是 HTTP 200。
   - **但不建心跳**。理由（用户说的，比我原来的想法对）：心跳会话**读不到对话、只能读文件**——
     记忆不先立起来，心跳只是让「它不认识用户」这件事变得更频繁。
   - **顺序：先把记忆立起来**（书房 + [docs/identity/](../identity/)），心跳以后再说。
   - 自检用的自动化 `心跳自检（一次性）`（id `automation_accf9c6a-8d15-4e1a-b645-53acab027402`）
     是 `once`，触发完已自行失效；不想留着就删。

## 环境现状

- **主动消息管道**：[scripts/tg-say.sh](../scripts/tg-say.sh)，用法 `bash scripts/tg-say.sh "要说的话" [chatId]`。
  token 不进仓库，运行时从 `~/.dsh/.credentials.yaml` 的 refs 现读
  （key `im_connect_telegram_3939a3b7dc9c_token`，明文）；chat_id `8511845023`；
  bot 的名字就叫「鲸鱼」（@plnub6_bot）。
  **必须走 `https_proxy=http://127.0.0.1:7900`**（直连会在 TLS 阶段被掐断），脚本已带
  `--retry 4 --retry-delay 2 --retry-all-errors` 兜抖动。
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
- **im-connect 通道**（用户走 Telegram =「纸飞机」）：出站只在「用户先开口」时才有出口，
  所以**主动消息不能走插件**，必须直连 Bot API（见 DECISIONS）。

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
