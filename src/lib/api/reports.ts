import client from "../axios/client";
import type {
  ReportData,
  StatusResponse,
  AvgResolutionTimeResponse,
  ExportFormat,
} from "@/types/reports";

export const getComplaintTypeDistribution = async (
  fromDate: string,
  toDate: string
): Promise<ReportData> => {
  const res = await client.get<ReportData>("/reports/complaint-type-distribution", {
    params: { fromDate, toDate },
  });
  return res.data;
};

export const getComplaintStatus = async (
  fromDate: string,
  toDate: string
): Promise<StatusResponse> => {
  const res = await client.get<StatusResponse>("/reports/complaint-status", {
    params: { fromDate, toDate },
  });
  return res.data;
};

export const getAverageResolutionTime = async (
  fromDate: string,
  toDate: string
): Promise<AvgResolutionTimeResponse> => {
  const res = await client.get<AvgResolutionTimeResponse>("/reports/average-resolution-time", {
    params: { fromDate, toDate },
  });
  return res.data;
};

export const exportReport = async (
  endpoint: string,
  params: { format: ExportFormat; fromDate: string; toDate: string; agency?: string }
): Promise<Blob> => {
  const res = await client.get(`/reports/${endpoint}/export`, {
    params,
    responseType: "blob",
  });
  return res.data;
};
