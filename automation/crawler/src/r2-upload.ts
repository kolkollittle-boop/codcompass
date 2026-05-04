/**
 * Cloudflare R2（S3 兼容 API）上传。
 *
 * 环境变量（全部必填才会启用）：
 * - R2_ACCOUNT_ID
 * - R2_ACCESS_KEY_ID
 * - R2_SECRET_ACCESS_KEY
 * - R2_BUCKET_NAME
 * - R2_PUBLIC_BASE_URL  对外访问的自定义域名或 r2.dev 公共 URL，勿尾斜杠
 *
 * 可选：
 * - R2_ENDPOINT          覆盖默认 https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 * - R2_UPLOAD_ENABLED    设为 false 关闭上传（即使密钥齐全）
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

export function isR2UploadEnabled(): boolean {
  if (['false', '0', 'no'].includes(String(process.env.R2_UPLOAD_ENABLED ?? '').toLowerCase())) {
    return false;
  }
  return !!(
    process.env.R2_ACCOUNT_ID?.trim() &&
    process.env.R2_ACCESS_KEY_ID?.trim() &&
    process.env.R2_SECRET_ACCESS_KEY?.trim() &&
    process.env.R2_BUCKET_NAME?.trim() &&
    process.env.R2_PUBLIC_BASE_URL?.trim()
  );
}

function getS3(): S3Client {
  if (client) return client;
  const accountId = process.env.R2_ACCOUNT_ID!.trim();
  const endpoint =
    process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;

  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
    },
  });
  return client;
}

export function publicObjectUrl(objectKey: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/+$/, '');
  const key = objectKey.replace(/^\/+/, '');
  return `${base}/${key}`;
}

export async function uploadBufferToR2(
  objectKey: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME!.trim();
  await getS3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    })
  );
}
