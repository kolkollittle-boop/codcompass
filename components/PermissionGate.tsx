'use client';

import { useSession } from 'next-auth/react';
import { getUserPermissions, PlanType, Permission, hasPermission } from '@/lib/permissions';

/**
 * Permission-based component wrapper
 * Shows children only if user has required permission
 */
export function RequirePermission({
  permission,
  fallback,
  children,
}: {
  permission: keyof Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return fallback || null;
  }

  const plan = (session.user as any).plan || 'FREE';
  const role = (session.user as any).role || 'USER';
  const permissions = getUserPermissions(plan as PlanType, role);

  if (!hasPermission(permissions, permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Plan-based component wrapper
 * Shows children only if user has required plan or higher
 */
export function RequirePlan({
  plan,
  fallback,
  children,
}: {
  plan: PlanType;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return fallback || null;
  }

  const userPlan = (session.user as any).plan || 'FREE';
  const planHierarchy = { FREE: 0, BUILDER: 1, PRO: 2, ENTERPRISE: 3 };
  const requiredLevel = planHierarchy[plan];
  const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;

  if (userLevel < requiredLevel) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Hook to get user permissions
 */
export function usePermissions() {
  const { data: session } = useSession();
  
  const plan = (session?.user as any)?.plan || 'FREE';
  const role = (session?.user as any)?.role || 'USER';
  
  return getUserPermissions(plan as PlanType, role);
}
