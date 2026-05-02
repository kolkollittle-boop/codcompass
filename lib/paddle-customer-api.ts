/**
 * Paddle Billing REST — resolve customer email for webhook / subscription matching.
 */

function paddleApiBase(): string {
  return process.env.PADDLE_ENV === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';
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
  try {
    const res = await fetch(`${paddleApiBase()}/customers/${customerId}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Paddle-Version': '1',
      },
    });
    if (!res.ok) {
      console.warn('[Paddle API] get customer failed', customerId, res.status);
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
