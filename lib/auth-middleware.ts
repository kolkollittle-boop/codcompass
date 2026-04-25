import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Authentication middleware for API routes
 * Supports both API Key and User Session authentication
 */

export async function authenticateRequest(req: NextRequest): Promise<{
  authenticated: boolean;
  user?: any;
  error?: string;
}> {
  // Method 1: API Key Authentication
  const apiKey = req.headers.get('X-API-Key');
  if (apiKey) {
    const validApiKeys = process.env.API_KEYS?.split(',') || [];
    
    if (validApiKeys.includes(apiKey)) {
      return {
        authenticated: true,
        user: { type: 'api-key', key: apiKey },
      };
    }
    
    return {
      authenticated: false,
      error: 'Invalid API key',
    };
  }

  // Method 2: User Session Authentication (NextAuth v5)
  try {
    const session = await auth();
    
    if (session?.user) {
      // Check if user has admin/editor role
      const userRole = (session.user as any).role || 'USER';
      
      if (userRole === 'ADMIN' || userRole === 'EDITOR') {
        return {
          authenticated: true,
          user: { type: 'user', ...session.user },
        };
      }
      
      return {
        authenticated: false,
        error: 'Insufficient permissions. Admin or Editor role required.',
      };
    }
  } catch (error) {
    console.error('[Auth] Session check error:', error);
  }

  return {
    authenticated: false,
    error: 'Authentication required. Provide X-API-Key header or login.',
  };
}

/**
 * Rate limiting middleware
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
