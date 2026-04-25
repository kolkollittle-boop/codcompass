import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissions, PlanType, hasPermission, PERMISSIONS } from '@/lib/permissions';

/**
 * Permission-based API middleware
 * 
 * Usage:
 * export const middleware = createPermissionMiddleware({
 *   requirePlan: 'BUILDER', // Minimum plan required
 *   requirePermission: 'canViewPremiumArticles', // Specific permission
 * });
 */

export interface PermissionMiddlewareOptions {
  requirePlan?: PlanType;
  requirePermission?: keyof typeof PERMISSIONS.FREE;
  requireRole?: 'USER' | 'EDITOR' | 'ADMIN';
}

export function createPermissionMiddleware(options: PermissionMiddlewareOptions) {
  return async function middleware(req: NextRequest) {
    // Get user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user permissions
    const plan = (session.user as any).plan || 'FREE';
    const role = (session.user as any).role || 'USER';
    const permissions = getUserPermissions(plan as PlanType, role);

    // Check role requirement
    if (options.requireRole) {
      const roleHierarchy = { USER: 0, EDITOR: 1, ADMIN: 2 };
      const requiredLevel = roleHierarchy[options.requireRole];
      const userLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
      
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: 'Insufficient permissions. Required role: ' + options.requireRole },
          { status: 403 }
        );
      }
    }

    // Check plan requirement
    if (options.requirePlan) {
      const planHierarchy = { FREE: 0, BUILDER: 1, PRO: 2, ENTERPRISE: 3 };
      const requiredLevel = planHierarchy[options.requirePlan];
      const userLevel = planHierarchy[plan as keyof typeof planHierarchy] || 0;
      
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { 
            error: 'Upgrade required',
            requiredPlan: options.requirePlan,
            currentPlan: plan,
            upgradeUrl: '/pricing'
          },
          { status: 403 }
        );
      }
    }

    // Check specific permission
    if (options.requirePermission) {
      if (!hasPermission(permissions, options.requirePermission)) {
        return NextResponse.json(
          { 
            error: 'Permission denied',
            requiredPermission: options.requirePermission,
            upgradeUrl: '/pricing'
          },
          { status: 403 }
        );
      }
    }

    // Add permissions to request headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-plan', plan);
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-user-permissions', JSON.stringify(permissions));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}

/**
 * Rate limiting middleware based on plan
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkPlanRateLimit(
  session: any,
  plan: PlanType = 'FREE',
  windowMs: number = 60000
): boolean {
  const permissions = getUserPermissions(plan, (session?.user as any)?.role || 'USER');
  const limit = permissions.apiRequestsPerMinute;
  
  // 0 means no API access
  if (limit === 0) {
    return false;
  }
  
  // -1 means unlimited
  if (limit === -1) {
    return true;
  }

  const identifier = session?.user?.id || 'anonymous';
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
