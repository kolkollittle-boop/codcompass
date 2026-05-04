#!/bin/bash
# 测试推送一篇文章到云端 Ingest API

INGEST_URL="https://www.codcompass.com/api/articles/ingest"
SECRET="sk-1126-0013-1024-2233"

echo "📡 推送测试文章到 ${INGEST_URL}..."

curl -s -w "\n\nHTTP Status: %{http_code}\n" -X POST "${INGEST_URL}" \
  -H "Content-Type: application/json" \
  -H "X-Ingest-Secret: ${SECRET}" \
  -d '{
    "title": "Test Article: Understanding TypeScript Generics",
    "content": "# Understanding TypeScript Generics\n\n## Introduction\nTypeScript generics allow you to write flexible, reusable functions and classes that work with multiple types while maintaining type safety.\n\n## Basic Example\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst result = identity<string>(\"hello\");\n```\n\n## Why Use Generics?\n1. **Type Safety**: The compiler checks types at compile time\n2. **Reusability**: One implementation works with many types\n3. **No Type Assertions**: Avoid `any` and unsafe casts\n\n## Generic Constraints\n```typescript\ninterface HasLength {\n  length: number;\n}\n\nfunction logLength<T extends HasLength>(arg: T): T {\n  console.log(arg.length);\n  return arg;\n}\n```\n\n## Conclusion\nGenerics are a powerful feature that enables writing type-safe, reusable code in TypeScript.",
    "sourceUrl": "https://dev.to/test-user/test-typescript-generics",
    "score": 85,
    "difficulty_level": "L2",
    "is_promotional": false,
    "mentor_summary": "A comprehensive guide to TypeScript generics, covering basic syntax, constraints, and practical examples for writing type-safe reusable code.",
    "chinese_preview": "TypeScript 泛型允许你编写灵活、可复用的函数和类，在与多种类型配合使用时仍保持类型安全。",
    "images": [],
    "tags": ["typescript", "generics", "type-safety"],
    "reading_time_minutes": 5,
    "expected_outcome": "Understand how to write type-safe reusable functions with generics",
    "excerpt": "A comprehensive guide to TypeScript generics...",
    "articleType": "KB",
    "kbSectionSlug": "cc20-4-2-code-quality",
    "blogCategorySlug": null,
    "routingConfidence": 0.9,
    "routingReasoning": "This is a technical tutorial/explanation about TypeScript generics, focusing on principles and standard usage patterns. It answers what generics are and how to use them, which aligns with KB characteristics.",
    "routerKeywords": ["typescript", "generics", "type-safety"],
    "simhash": "a1b2c3d4e5f6a7b8",
    "sourceAuthor": "Test Author"
  }'

echo ""
echo "✅ 测试完成"
