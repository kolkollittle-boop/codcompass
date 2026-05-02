/**
 * Paddle Billing REST — resolve customer email for webhook / subscription matching.
 */

/** Live keys must hit api.paddle.com; sandbox keys hit sandbox-api.paddle.com */
export function getPaddleApiBase(): string {
  const raw = (process.env.PADDLE_ENV || '').toLowerCase().trim();
  if (raw === 'production' || raw === 'live') {
    return 'https://api.paddle.com';
  }
  if (raw === 'sandbox' || raw === 'test') {
    return 'https://sandbox-api.paddle.com';
  }
  const key = process.env.PADDLE_API_KEY || '';
  if (/pdl_live|_live_/i.test(key)) {
    return 'https://api.paddle.com';
  }
  if (/pdl_sandbox|pdl_test|_test_|_sandbox_/i.test(key)) {
    return 'https://sandbox-api.paddle.com';
  }
  return 'https://sandbox-api.paddle.com';
}

export async function fetchPaddleCustomerEmail(
  customerId: string | null | undefined
): Promise<string | null> {
  if (!customerId || !customerId.startsWith('ctm_')) return null;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    console.warn('[Paddle API] PADDLE_API_KEY not set; cannot resolve customer email');
    return null;
  }
  const base = getPaddleApiBase();
  try {
    const res = await fetch(`${base}/customers/${customerId}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Paddle-Version': '1',
      },
    });
    if (!res.ok) {
      const hint =
        res.status === 401
          ? ' (401: use Seller API key from Paddle → Developer Tools → Authentication, not the Paddle.js client token)'
          : '';
      let body = '';
      try {
        body = (await res.text()).slice(0, 280);
      } catch {
        /* ignore */
      }
      console.warn(
        '[Paddle API] GET /customers/',
        customerId,
        'failed:',
        res.status,
        hint,
        body ? `body=${body}` : ''
      );
      return null;
    }
    const json = (await res.json()) as { data?: { email?: string } };
    const email = json?.data?.email;
    return typeof email === 'string' && email.trim() ? email.trim() : null;
  } catch (e) {
    console.warn('[Paddle API] get customer error', customerId, e);
    return null;
  }
}
