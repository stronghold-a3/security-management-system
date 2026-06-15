/**
 * RBAC (Role-Based Access Control) Configuration
 * Defines user roles and permissions for the Security Management System
 *
 * What it does:
 * - Defines role-based permissions
 * - Provides utilities to check user permissions
 * - Integrates with authentication system
 */

/**
 * User roles in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  AUDITOR = 'auditor',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * Available permissions in the system
 */
export enum Permission {
  // User Management
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',

  // Security Management
  CREATE_SECURITY_POLICY = 'create:security_policy',
  READ_SECURITY_POLICY = 'read:security_policy',
  UPDATE_SECURITY_POLICY = 'update:security_policy',
  DELETE_SECURITY_POLICY = 'delete:security_policy',

  // Audit & Compliance
  VIEW_AUDIT_LOG = 'view:audit_log',
  EXPORT_AUDIT_LOG = 'export:audit_log',
  VIEW_COMPLIANCE_REPORT = 'view:compliance_report',
  GENERATE_COMPLIANCE_REPORT = 'generate:compliance_report',

  // System Administration
  VIEW_SYSTEM_SETTINGS = 'view:system_settings',
  UPDATE_SYSTEM_SETTINGS = 'update:system_settings',
  MANAGE_BACKUPS = 'manage:backups',
  VIEW_LOGS = 'view:logs',

  // Reports
  VIEW_REPORTS = 'view:reports',
  CREATE_REPORTS = 'create:reports',
  EDIT_REPORTS = 'edit:reports',
  DELETE_REPORTS = 'delete:reports',
}

/**
 * Role-permission mapping
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),

  [UserRole.ADMIN]: [
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.CREATE_SECURITY_POLICY,
    Permission.READ_SECURITY_POLICY,
    Permission.UPDATE_SECURITY_POLICY,
    Permission.DELETE_SECURITY_POLICY,
    Permission.VIEW_AUDIT_LOG,
    Permission.VIEW_COMPLIANCE_REPORT,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.UPDATE_SYSTEM_SETTINGS,
    Permission.MANAGE_BACKUPS,
    Permission.VIEW_LOGS,
    Permission.VIEW_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.EDIT_REPORTS,
    Permission.DELETE_REPORTS,
  ],

  [UserRole.MANAGER]: [
    Permission.READ_USER,
    Permission.READ_SECURITY_POLICY,
    Permission.UPDATE_SECURITY_POLICY,
    Permission.VIEW_AUDIT_LOG,
    Permission.EXPORT_AUDIT_LOG,
    Permission.VIEW_COMPLIANCE_REPORT,
    Permission.GENERATE_COMPLIANCE_REPORT,
    Permission.VIEW_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.EDIT_REPORTS,
  ],

  [UserRole.OPERATOR]: [
    Permission.READ_USER,
    Permission.READ_SECURITY_POLICY,
    Permission.VIEW_AUDIT_LOG,
    Permission.VIEW_REPORTS,
    Permission.CREATE_REPORTS,
  ],

  [UserRole.AUDITOR]: [
    Permission.VIEW_AUDIT_LOG,
    Permission.EXPORT_AUDIT_LOG,
    Permission.VIEW_COMPLIANCE_REPORT,
    Permission.GENERATE_COMPLIANCE_REPORT,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.USER]: [
    Permission.READ_USER,
    Permission.READ_SECURITY_POLICY,
  ],

  [UserRole.GUEST]: [],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};

/**
 * Check if a user has any of the given permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a user has all of the given permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return rolePermissions[role] ?? [];
};

export default {
  UserRole,
  Permission,
  rolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
};
