#!/bin/bash
# ============================================================
# 精益分发矩阵 2.5 - API 闪击队发帖脚本
# 用法: ./api-post.sh <platform> <title_file> <content_file>
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="/Users/kol/Desktop/CyberPunkWeb/.env.local"

# 加载环境变量 (安全方式，防止 shell 变量扩展)
if [ -f "$ENV_FILE" ]; then
  while IFS='=' read -r key value; do
    case "$key" in
      \#*|'') continue ;;
      *) export "$key=$value" ;;
    esac
  done < "$ENV_FILE"
fi

PLATFORM="$1"
TITLE_FILE="$2"
CONTENT_FILE="$3"

if [ -z "$PLATFORM" ] || [ -z "$TITLE_FILE" ] || [ -z "$CONTENT_FILE" ]; then
  echo "用法: $0 <devto|hashnode> <title.md> <content.md>"
  exit 1
fi

# 安全读取，防止 zsh/bash 变量扩展 ($0.12 → /bin/zsh.12)
TITLE=$(cat "$TITLE_FILE")
CONTENT=$(cat "$CONTENT_FILE")

# JSON 安全编码函数 (使用 jq -Rs 防止注入)
json_encode() {
  printf '%s' "$1" | jq -Rs .
}

case "$PLATFORM" in
  devto)
    if [ -z "$DEVTO_API_KEY" ]; then
      echo "❌ DEVTO_API_KEY 未配置，请在 .env.local 中添加"
      exit 1
    fi
    echo "🚀 发布到 Dev.to..."
    
    TITLE_JSON=$(json_encode "$TITLE")
    CONTENT_JSON=$(json_encode "$CONTENT")
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://dev.to/api/articles" \
      -H "api-key: $DEVTO_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"article\":{\"title\":$TITLE_JSON,\"body_markdown\":$CONTENT_JSON,\"tags\":[\"codcompass\",\"ai\",\"knowledgebase\",\"webdev\"],\"published\":true}}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
      URL=$(echo "$BODY" | jq -r '.url // .article.url // "unknown"')
      echo "✅ Dev.to 发布成功: $URL"
    else
      echo "❌ Dev.to 发布失败 (HTTP $HTTP_CODE): $(echo "$BODY" | jq -r '.error // .message // "unknown"' 2>/dev/null || echo "$BODY")"
    fi
    ;;

  hashnode)
    echo "⏭️ Hashnode 已降级为草稿模式，请使用 browser 自动化或手动发布"
    exit 0
    ;;

  *)
    echo "❌ 不支持的平台: $PLATFORM (支持: devto, hashnode)"
    exit 1
    ;;
esac
