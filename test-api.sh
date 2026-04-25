#!/bin/bash
# Test script for Articles API
# Usage: ./test-api.sh

# Configuration
API_URL="https://www.codcompass.com/api/articles"
API_KEY="your-api-key-here"  # Replace with your actual API key

echo "🧪 Testing Articles API..."
echo ""

# Test 1: GET articles (public)
echo "📋 Test 1: GET articles (public)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "$API_URL?limit=2" | head -20
echo ""

# Test 2: POST article (with API Key)
echo "📝 Test 2: POST article (with API Key)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "articles": [
      {
        "slug": "test-article-'"$(date +%s)"'",
        "titleEn": "Test Article via API",
        "contentEn": "<h2>Test Content</h2><p>This is a test article created via API.</p>",
        "excerptEn": "Test excerpt",
        "descriptionEn": "Test description",
        "isPremium": false,
        "isPublished": true,
        "categorySlug": "react"
      }
    ]
  }' | head -20
echo ""

# Test 3: GET articles (authenticated)
echo "🔐 Test 3: GET articles (authenticated)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-API-Key: $API_KEY" \
  "$API_URL?limit=2" | head -20
echo ""

# Test 4: DELETE article (with API Key)
echo "🗑️  Test 4: DELETE article (with API Key)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X DELETE "$API_URL?slug=test-article" \
  -H "X-API-Key: $API_KEY" | head -10
echo ""

echo "✅ Tests completed!"
