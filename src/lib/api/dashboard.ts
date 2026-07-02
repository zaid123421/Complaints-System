import client from "../axios/client";
import type { DashboardData } from "@/types/dashboard";

export interface DashboardParams {
  fromDate?: string;
  toDate?: string;
  overdueDaysThreshold?: number;
}

export const getDashboardOverview = async (
  params: DashboardParams
): Promise<DashboardData> => {
  const res = await client.get<DashboardData>("/admin/dashboard/overview", { params });
  return res.data;
};

export const exportDashboard = async (params: DashboardParams & { format?: string }): Promise<Blob> => {
  const res = await client.get("/admin/dashboard/export", {
    params: { format: "pdf", ...params },
    responseType: "blob",
  });
  return res.data;
};
