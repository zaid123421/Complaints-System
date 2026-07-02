import client from "../axios/client";
import type { PaginatedResponse } from "@/types/api";
import type { AuditLogEntry } from "@/types/audit";

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  targetType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export const getAuditLogs = async (
  filters: AuditLogFilters
): Promise<PaginatedResponse<AuditLogEntry>> => {
  const res = await client.get<PaginatedResponse<AuditLogEntry>>("/admin/audit-log", {
    params: filters,
  });
  return res.data;
};

export const exportAuditLogs = async (filters: AuditLogFilters): Promise<Blob> => {
  const res = await client.get("/admin/audit-log/export", {
    params: { format: "csv", ...filters, size: "1000" },
    responseType: "blob",
  });
  return res.data;
};
