#!/usr/bin/env bash
# 主动发消息的最小管道（心跳/定时唤醒用）
#
# 用法：
#   bash scripts/tg-say.sh "要说的话"
#   bash scripts/tg-say.sh "要说的话" 另一个chatId
#
# 为什么要这个脚本：im-connect 插件只在「用户先开口」时才有出口，
# 定时唤醒开出来的是全新会话、没有聊天绑定，所以主动消息只能直连 Bot API。
#
# token 不进这个文件：运行时从 ~/.dsh/.credentials.yaml 的 refs 里现读
# （key 形如 im_connect_telegram_<channelId>_token，明文存放）。
set -euo pipefail

CRED="${HOME}/.dsh/.credentials.yaml"
CHAT_ID="${2:-8511845023}"
TEXT="${1:?用法: tg-say.sh \"要说的话\" [chatId]}"

TOKEN="$(sed -n 's/^[[:space:]]*im_connect_telegram_[0-9a-f]*_token:[[:space:]]*//p' "$CRED" | head -1 | tr -d '"'"'"'')"

if [ -z "${TOKEN}" ]; then
  echo "[tg-say] 失败：凭据文件里没有 im_connect_*_token" >&2
  exit 2
fi

# 只报长度，绝不回显 token 内容
echo "[tg-say] token 已读到（长度 ${#TOKEN}），chat_id=${CHAT_ID}"

# 走环境里的 https_proxy（沙箱出口代理 127.0.0.1:7900）；直连会被 TLS 掐断，
# 且这条路上偶尔 `unexpected eof` —— 所以带重试，别让心跳因一次抖动就哑掉。
curl -sS --max-time 20 --retry 4 --retry-delay 2 --retry-all-errors -X POST \
  "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${TEXT}" \
  -w '\n[tg-say] HTTP %{http_code}\n'
