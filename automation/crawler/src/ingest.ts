import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '../../.env.local' });

export async function ingestArticle(data: any) {
  const secret = process.env.INGEST_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!secret) {
    throw new Error("❌ Missing INGEST_SECRET environment variable.");
  }

  console.log(`📡 Sending data to ${siteUrl}/api/articles/ingest...`);

  const res = await fetch(`${siteUrl}/api/articles/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ingest-Secret": secret,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ingest API Error: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  console.log(`✅ Server Response: ${json.message || 'Success'}`);
  return json;
}
