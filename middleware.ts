import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 暂时不做认证拦截，所有页面开放
  // 未来接入认证后在这里加判断
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/kb/:path*',
    '/dashboard/:path*',
  ],
};
