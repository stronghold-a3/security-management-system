/**
 * Audit Logger Utility
 * Logs all security-sensitive operations with timestamps and user information
 *
 * What it does:
 * - Records all audit events with timestamps
 * - Tracks user actions (create, read, update, delete)
 * - Stores audit logs in database for compliance
 * - Integrates with DOLE DO-174 compliance requirements
 */

import { logger } from './logger';

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',

  // Security Policies
  POLICY_CREATED = 'POLICY_CREATED',
  POLICY_UPDATED = 'POLICY_UPDATED',
  POLICY_DELETED = 'POLICY_DELETED',

  // Data Access
  DATA_VIEWED = 'DATA_VIEWED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_DELETED = 'DATA_DELETED',

  // System Administration
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  SECURITY_SCAN_RUN = 'SECURITY_SCAN_RUN',

  // Compliance
  COMPLIANCE_REPORT_GENERATED = 'COMPLIANCE_REPORT_GENERATED',
  AUDIT_LOG_ACCESSED = 'AUDIT_LOG_ACCESSED',
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  eventType: AuditEventType;
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Audit Logger class
 */
class AuditLogger {
  private endpoint: string = import.meta.env.VITE_AUDIT_LOG_ENDPOINT || '/api/audit-logs';
  private enableRemote: boolean = import.meta.env.PROD;

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };

    // Log to local logger
    logger.info(`Audit: ${entry.eventType}`, {
      userId: entry.userId,
      resourceType: entry.resourceType,
      action: entry.action,
      status: entry.status,
    });

    // Send to remote audit log endpoint
    if (this.enableRemote) {
      await this.sendToRemote(auditEntry);
    }
  }

  /**
   * Log user login
   */
  async logLogin(userId: string, email: string, userRole: string): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGIN,
      userId,
      userEmail: email,
      userRole,
      action: 'User logged in',
      resourceType: 'AUTH',
      status: 'SUCCESS',
    });
  }

  /**
   * Log user logout
   */
  async logLogout(userId: string): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGOUT,
      userId,
      action: 'User logged out',
      resourceType: 'AUTH',
      status: 'SUCCESS',
    });
  }

  /**\n   * Log failed login attempt\n   */\n  async logFailedLogin(email: string, reason: string): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGIN_FAILED,
      userId: 'UNKNOWN',
      userEmail: email,
      action: `Failed login attempt: ${reason}`,
      resourceType: 'AUTH',
      status: 'FAILURE',
      errorMessage: reason,
    });
  }

  /**
   * Log user creation
   */
  async logUserCreated(userId: string, newUserId: string, newUserRole: string): Promise<void> {
    await this.log({
      eventType: AuditEventType.USER_CREATED,
      userId,
      action: `Created user: ${newUserId}`,
      resourceType: 'USER',
      resourceId: newUserId,
      changes: { role: newUserRole },
      status: 'SUCCESS',
    });
  }

  /**
   * Log user update
   */
  async logUserUpdated(
    userId: string,
    updatedUserId: string,
    changes: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.USER_UPDATED,
      userId,
      action: `Updated user: ${updatedUserId}`,
      resourceType: 'USER',
      resourceId: updatedUserId,
      changes,
      status: 'SUCCESS',
    });
  }

  /**
   * Log data access/export
   */
  async logDataExport(userId: string, dataType: string, recordCount: number): Promise<void> {
    await this.log({
      eventType: AuditEventType.DATA_EXPORTED,
      userId,
      action: `Exported ${recordCount} ${dataType} records`,
      resourceType: dataType,
      status: 'SUCCESS',
      metadata: { recordCount },
    });
  }

  /**
   * Log security policy change
   */
  async logPolicyChange(
    userId: string,
    policyId: string,
    changes: Record<string, any>,
    isCreation: boolean = false
  ): Promise<void> {
    await this.log({
      eventType: isCreation ? AuditEventType.POLICY_CREATED : AuditEventType.POLICY_UPDATED,
      userId,
      action: `${isCreation ? 'Created' : 'Updated'} security policy: ${policyId}`,
      resourceType: 'SECURITY_POLICY',
      resourceId: policyId,
      changes,
      status: 'SUCCESS',
    });
  }

  /**
   * Log system configuration change
   */
  async logSystemConfigChange(userId: string, configKey: string, newValue: any): Promise<void> {
    await this.log({
      eventType: AuditEventType.SYSTEM_CONFIG_CHANGED,
      userId,
      action: `Changed system configuration: ${configKey}`,
      resourceType: 'SYSTEM_CONFIG',
      changes: { [configKey]: newValue },
      status: 'SUCCESS',
    });
  }

  /**
   * Get client IP address
   */\n  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Send audit log to remote endpoint
   */\n  private async sendToRemote(entry: AuditLogEntry): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      logger.error('Failed to send audit log to remote endpoint', error instanceof Error ? error : new Error(String(error)), {
        endpoint: this.endpoint,
      });
    }
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

export default auditLogger;
