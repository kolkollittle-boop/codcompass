/** 64-bit SimHash for near-duplicate detection (Hamming distance). */

const MASK64 = (BigInt(1) << BigInt(64)) - BigInt(1);
const FNV_OFFSET = BigInt('14695981039346656037');
const FNV_PRIME = BigInt('1099511628211');

function hashToken(token: string): bigint {
  let h = FNV_OFFSET;
  for (let i = 0; i < token.length; i++) {
    h ^= BigInt(token.charCodeAt(i));
    h = (h * FNV_PRIME) & MASK64;
  }
  return h;
}

function popcount64(x: bigint): number {
  let n = 0;
  let v = x & MASK64;
  const zero = BigInt(0);
  while (v > zero) {
    n++;
    v &= v - BigInt(1);
  }
  return n;
}

export function computeSimHash(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = normalized.split(' ').filter((t) => t.length > 2).slice(0, 800);
  const dims = new Array<number>(64).fill(0);

  for (const token of tokens) {
    const h = hashToken(token);
    for (let i = 0; i < 64; i++) {
      const bit = (h >> BigInt(i)) & BigInt(1);
      dims[i] += bit === BigInt(1) ? 1 : -1;
    }
  }

  let fingerprint = BigInt(0);
  const one = BigInt(1);
  for (let i = 0; i < 64; i++) {
    if (dims[i] > 0) fingerprint |= one << BigInt(i);
  }
  return fingerprint.toString(16).padStart(16, '0');
}

export function hammingDistanceHex(a: string, b: string): number {
  const ai = BigInt('0x' + a);
  const bi = BigInt('0x' + b);
  return popcount64(ai ^ bi);
}
