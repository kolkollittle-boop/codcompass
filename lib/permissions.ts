/**
 * User Permission Groups System
 * 
 * Defines permissions based on subscription plans
 */

export type PlanType = 'FREE' | 'BUILDER' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'USER' | 'EDITOR' | 'ADMIN';

export interface Permission {
  // Content Access
  canViewArticles: boolean;
  canViewPremiumArticles: boolean;
  canViewAllArticles: boolean;
  maxArticlesPerDay: number;
  
  // Features
  canBookmark: boolean;
  maxBookmarks: number;
  canCreatePlaylists: boolean;
  canDownloadPDF: boolean;
  canAccessAPI: boolean;
  
  // Admin Features
  canManageArticles: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  
  // Rate Limits
  apiRequestsPerMinute: number;
  apiRequestsPerDay: number;
}

// Permission definitions for each plan
export const PERMISSIONS: Record<PlanType, Permission> = {
  FREE: {
    canViewArticles: true,
    canViewPremiumArticles: false,
    canViewAllArticles: false,
    maxArticlesPerDay: 5,
    
    canBookmark: true,
    maxBookmarks: 3,
    canCreatePlaylists: false,
    canDownloadPDF: false,
    canAccessAPI: false,
    
    canManageArticles: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    
    apiRequestsPerMinute: 0,
    apiRequestsPerDay: 0,
  },
  BUILDER: {
    canViewArticles: true,
    canViewPremiumArticles: true,
    canViewAllArticles: false,
    maxArticlesPerDay: 50,
    
    canBookmark: true,
    maxBookmarks: 50,
    canCreatePlaylists: true,
    canDownloadPDF: false,
    canAccessAPI: false,
    
    canManageArticles: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    
    apiRequestsPerMinute: 10,
    apiRequestsPerDay: 1000,
  },
  PRO: {
    canViewArticles: true,
    canViewPremiumArticles: true,
    canViewAllArticles: true,
    maxArticlesPerDay: -1, // Unlimited
    
    canBookmark: true,
    maxBookmarks: -1, // Unlimited
    canCreatePlaylists: true,
    canDownloadPDF: true,
    canAccessAPI: true,
    
    canManageArticles: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageSettings: false,
    
    apiRequestsPerMinute: 100,
    apiRequestsPerDay: 10000,
  },
  ENTERPRISE: {
    canViewArticles: true,
    canViewPremiumArticles: true,
    canViewAllArticles: true,
    maxArticlesPerDay: -1, // Unlimited
    
    canBookmark: true,
    maxBookmarks: -1, // Unlimited
    canCreatePlaylists: true,
    canDownloadPDF: true,
    canAccessAPI: true,
    
    canManageArticles: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSettings: true,
    
    apiRequestsPerMinute: 1000,
    apiRequestsPerDay: -1, // Unlimited
  },
};

// Role-based permissions (ADMIN/EDITOR have additional permissions regardless of plan)
export const ROLE_PERMISSIONS: Record<UserRole, Partial<Permission>> = {
  USER: {},
  EDITOR: {
    canManageArticles: true,
  },
  ADMIN: {
    canManageArticles: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canViewAllArticles: true,
    maxArticlesPerDay: -1,
    maxBookmarks: -1,
    apiRequestsPerMinute: 1000,
    apiRequestsPerDay: -1,
  },
};

/**
 * Get user permissions based on plan and role
 */
export function getUserPermissions(plan: PlanType, role: UserRole = 'USER'): Permission {
  const basePermissions = { ...PERMISSIONS[plan] };
  const rolePermissions = ROLE_PERMISSIONS[role] || {};
  
  // Merge role permissions (role permissions override plan permissions)
  return {
    ...basePermissions,
    ...rolePermissions,
  };
}

/**
 * Check if user has permission
 */
export function hasPermission(
  permissions: Permission,
  check: keyof Permission
): boolean {
  const value = permissions[check];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value > 0 || value === -1; // -1 means unlimited
  }
  
  return false;
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  permissions: Permission,
  resource: { isPremium?: boolean; isPublished?: boolean }
): boolean {
  // Published articles are always accessible
  if (resource.isPublished) {
    return true;
  }
  
  // Premium articles require premium access
  if (resource.isPremium && !permissions.canViewPremiumArticles) {
    return false;
  }
  
  return true;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    FREE: 'Free',
    BUILDER: 'Builder',
    PRO: 'Pro',
    ENTERPRISE: 'Enterprise',
  };
  return names[plan];
}

/**
 * Get plan color
 */
export function getPlanColor(plan: PlanType): string {
  const colors: Record<PlanType, string> = {
    FREE: 'bg-gray-100 text-gray-800',
    BUILDER: 'bg-blue-100 text-blue-800',
    PRO: 'bg-indigo-100 text-indigo-800',
    ENTERPRISE: 'bg-purple-100 text-purple-800',
  };
  return colors[plan];
}
