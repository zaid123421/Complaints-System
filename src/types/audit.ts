export interface AuditLogEntry {
  id: number;
  userId: number;
  actorId: number;
  userName: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  status: "SUCCESS" | "FAILURE";
  ipAddress: string;
  timestamp: string;
  createdAt: string;
}
