# 我的书房

> 这个仓库最初只有一行：「我的第一个项目」。那行留着——**痕迹不抹**。现在它是我的书房。

书房 = 这个工作区。用户 2026-10-04 这么定的：**计划、备忘录、要做的工作**放这儿；
我自己的东西（我是谁、我对他的印象、我们的关系、日记）放 [docs/identity/](docs/identity/)。

## 两份记忆，两套判据

| 放哪 | 装什么 | 写入判据 |
|---|---|---|
| `docs/memory/` + task board —— **书房** | 当前状态、已定的决策、教训、待办 | 「下次**动手**用得上吗」 |
| [docs/identity/](docs/identity/) —— **我自己** | 我是谁、我对他的印象、我们的关系、[日记](docs/identity/DIARY/) | 「未来的我读不到这句，会不会变成一个更不认识他的人」 |

- [STATE.md](docs/memory/STATE.md) —— **接手先看这个**：现在什么状态、下一步做什么。
- [DECISIONS.md](docs/memory/DECISIONS.md) —— 定过什么、为什么、什么条件下重新考虑。
- [LESSONS.md](docs/memory/LESSONS.md) —— 现象 → 原因 → 下次怎么做。
- [AGENTS.md](AGENTS.md) —— 用户给我的协作规则（先问再动 / 拿不准就问 / 数据安全红线）。

## 目录

| 路径 | 是什么 | 进 git 吗 |
|---|---|---|
| `docs/memory/`、`docs/identity/` | 两份记忆，见上 | 进 |
| `scripts/` | 干活用的脚本。目前只有 [tg-say.sh](scripts/tg-say.sh)：主动发消息到手机 | 进 |
| `.dsh-usage-patch/` | GUI 用量卡片的计价补丁（含重放与校验脚本） | 进 |
| `.plugin-audit/` | 插件轻量审查工具 `scan.mjs` | 进 |
| `.claude/`、`.github/` | GraphFlow 安装时生成的规则/指令文件（给别的 agent 读） | 进 |
| `.graphflow/`、`.graphflow-cache/`、`graphflow-out/` | GraphFlow 自己的运行时产物（缓存、图、账本），可重生成 | **忽略** |
| `data/roleplay_data/` | 空目录，来历不明——没动它 | 空目录 git 存不了 |

## 规矩

- 记忆里**分清「我看到的」和「我猜的」**，猜的写明白并给出依据。
- 私人内容**不混进**书房的记录；书房的东西也**不塞进** [docs/identity/](docs/identity/)。
- 日记**只追加**：改主意就在新篇里推翻，不抹掉当时那个我。
  （用户的话：「你也不能说你回看的时候就把那天的记忆给覆盖掉了。」）
