#!/bin/bash
# 测试正式环境 ingest API 是否正常工作
# 使用方法: chmod +x scripts/test-ingest-remote.sh && ./scripts/test-ingest-remote.sh

set -e

INGEST_SECRET="${INGEST_SECRET:-sk-1126-0013-1024-2233}"
BASE_URL="${CRAWLER_INGEST_BASE_URL:-https://www.codcompass.com}"
PROXY="${HTTP_PROXY:-http://127.0.0.1:7897}"

echo "========================================="
echo "正式环境 Ingest API 测试"
echo "========================================="
echo "Base URL: $BASE_URL"
echo "Proxy: $PROXY"
echo "INGEST_SECRET: ${INGEST_SECRET:0:4}...${INGEST_SECRET: -4}"
echo "========================================="
echo ""

# 测试 payload（包含必填字段）
PAYLOAD='{
  "title": "远程测试文章",
  "content": "这是一篇用于测试正式环境 ingest API 的文章",
  "sourceUrl": "https://test-remote-ingest.com/article-'"$(date +%s)"'",
  "score": 85,
  "articleType": "KB",
  "kbSectionSlug": "cc20-archive",
  "routingConfidence": 0.9,
  "simhash": "'"$(date +%s)"'test1234567890"
}'

echo "发送测试请求..."
echo ""

# 通过代理发送请求
HTTP_CODE=$(curl -s -w "%{http_code}" \
  "$BASE_URL/api/articles/ingest" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-ingest-secret: $INGEST_SECRET" \
  -d "$PAYLOAD" \
  -x "$PROXY" \
  --connect-timeout 15 \
  --max-time 30 \
  -o /tmp/ingest-response.json 2>/dev/null || echo "000")

echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 推送成功！"
  echo "响应内容:"
  cat /tmp/ingest-response.json | python3 -m json.tool 2>/dev/null || cat /tmp/ingest-response.json
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ 401 Unauthorized - INGEST_SECRET 不匹配"
  echo ""
  echo "可能原因:"
  echo "1. Vercel 环境变量 INGEST_SECRET 未配置或值不正确"
  echo "2. 需要在 Vercel Dashboard 中添加/更新环境变量"
  echo ""
  echo "响应内容:"
  cat /tmp/ingest-response.json | python3 -m json.tool 2>/dev/null || cat /tmp/ingest-response.json
elif [ "$HTTP_CODE" = "000" ]; then
  echo "❌ 连接失败 - 无法通过代理连接到正式环境"
  echo ""
  echo "可能原因:"
  echo "1. Clash 代理未运行（检查 $PROXY）"
  echo "2. 网络连接问题"
else
  echo "⚠️  其他错误 (HTTP $HTTP_CODE)"
  echo "响应内容:"
  cat /tmp/ingest-response.json | python3 -m json.tool 2>/dev/null || cat /tmp/ingest-response.json
fi

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
