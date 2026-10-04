# dsh-usage 中转站价格表补丁

## 为什么需要补丁

GUI 侧边栏那张「用量」卡片由 `@linxin666/dsh-usage`（当前 0.4.4，npm 最新也是 0.4.4）提供。
它的价格表是**写在 lib/index.js 里的常量**，并且只对路由键 `deepseek` / `deepseek-official`
生效（`isDeepSeekProviderRoute` + `deepseekModelSpend`）；插件 Config schema 只有
`enabled` / `pollIntervalSec` / `retainDays` 三个字段，没有任何价格入口。
所以走第三方中转（provider 键 `xiaoji`、baseURL `https://api2.68886868.xyz`）时
`cost` 恒为 0 —— 这就是「一直找不到」的原因。

## 改了什么

`~/.dsh/profiles/web/node_modules/@linxin666/dsh-usage/lib/index.js`

1. 新增 `RESELLER_PRICES`，按 **baseURL origin** 匹配中转站，价格为人民币/百万 token，平铺（无高峰时段）：

   | origin | 输入（未命中缓存） | 输出 | 缓存读 |
   |---|---|---|---|
   | `https://api2.68886868.xyz` | 0.66 | 1.98 | 0.0132 |

2. 把计费公式从 `deepseekModelSpend` 里拆成 `priceRowSpend(price, totals, atMs)`。
3. `totalsFrom()` 折账时：命中 `RESELLER_PRICES` 的路线按该行计费，否则仍走原来的官方逻辑。
4. `loadPersisted()` 载入旧账本时，对「价格可算但 cost 仍为 0」的桶补算一次，
   这样打补丁之前已经记录的历史消耗也会显示金额。

因为按 origin 匹配，profile 里两条都指向该中转的路由（`xiaoji` 和 `deepseek-official`）都会被计价；
一旦 baseURL 改回官方 `api.deepseek.com`，就自动回到官方价格表，不会被误算。

## 生效方式

补丁改的是磁盘上的模块，**正在运行的 dsh web 进程里还是旧代码**。
需要重启 web 宿主（终端里 Ctrl-C 后重新 `dsh web`）并刷新页面。

## 插件升级后如何重放

`dsh plugin` / dshmarket 升级该插件会覆盖 `lib/index.js`，补丁随之失效。重放：

```bash
# 幂等：已打过补丁会直接提示 already patched
node .dsh-usage-patch/patch.mjs ~/.dsh/profiles/web/node_modules/@linxin666/dsh-usage/lib/index.js
# 校验（6 项断言 + 打印今日金额）
node .dsh-usage-patch/verify.mjs ~/.dsh/profiles/web/node_modules/@linxin666/dsh-usage/lib/index.js
```

升级前注意：目标文件曾是 pnpm store 的硬链接（link count 2），
`patch.mjs` 之外请用 `cp tmp && mv` 的方式替换以断开硬链接，避免改到 store 里的共享副本。

## 回滚

```bash
cp .dsh-usage-patch/dsh-usage-0.4.4.lib-index.js.orig \
   ~/.dsh/profiles/web/node_modules/@linxin666/dsh-usage/lib/index.js
```

## 目录内容

- `patch.mjs` —— 打补丁（幂等，锚点匹配数不对会报错退出）
- `verify.mjs` —— 从补丁后的文件里抽出计价区段单独跑断言
- `dsh-usage-0.4.4.lib-index.js.orig` —— 打补丁前的原文件
- `dsh-usage-relay-pricing.patch` —— 统一 diff，便于对照
