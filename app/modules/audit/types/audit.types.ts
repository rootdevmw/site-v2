export type AuditSnapshot = Record<string, unknown> | null;

export type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  user?: { id: string; email?: string | null; member?: { firstName?: string | null; lastName?: string | null } | null } | null;
  description?: string | null;
  before: AuditSnapshot;
  after: AuditSnapshot;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  protectedFields?: boolean;
};
