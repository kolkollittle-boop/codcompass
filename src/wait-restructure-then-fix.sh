#!/bin/bash
# Monitor restructure processes, run fix when all done

echo "🔍 Monitoring restructure processes..."

while true; do
  COUNT=$(ps aux | grep -E "tsx.*(restructure|batch2)" | grep -v grep | wc -l)
  if [ "$COUNT" -eq 0 ]; then
    echo "✅ All restructure processes finished!"
    echo "⏳ Running fix-chinese-desc.ts..."
    cd /Users/kol/Desktop/CyberPunkWeb
    npx tsx src/fix-chinese-desc.ts 2>&1
    break
  fi
  echo "   $COUNT restructure processes still running... ($(date '+%H:%M:%S'))"
  sleep 60
done
