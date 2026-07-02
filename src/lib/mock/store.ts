import type { AuditLogEntry } from "@/types/audit";
import type { PaginatedResponse } from "@/types/api";
import { createSeedData, type MockStoreData } from "./seed";

const GLOBAL_KEY = "__complaints_mock_store__";

export function getStore(): MockStoreData {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: MockStoreData };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = createSeedData();
  }
  return g[GLOBAL_KEY];
}

export function paginate<T>(
  items: T[],
  page: number,
  size: number
): PaginatedResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const start = safePage * size;
  const content = items.slice(start, start + size);

  return {
    content,
    page: safePage,
    size,
    totalElements,
    totalPages,
    hasNext: safePage < totalPages - 1,
    hasPrevious: safePage > 0,
  };
}

export function statusToDetail(status: string): string {
  return status === "IN_PROGRESS" ? "IN PROGRESS" : status;
}

export function statusFromDetail(status: string): string {
  return status === "IN PROGRESS" ? "IN_PROGRESS" : status;
}

export function parseAuthHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export function requireAuth(authHeader: string | null): string | null {
  const token = parseAuthHeader(authHeader);
  if (!token || !token.startsWith("mock-token-")) return null;
  return token;
}

export function addAuditLog(
  store: MockStoreData,
  entry: Omit<AuditLogEntry, "id" | "timestamp" | "createdAt">
) {
  const now = new Date().toISOString();
  store.auditLogs.unshift({
    ...entry,
    id: store.nextAuditId++,
    timestamp: now,
    createdAt: now,
  });
}
