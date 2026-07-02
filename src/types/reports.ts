export interface ComplaintDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface ReportData {
  distribution: ComplaintDistribution[];
  totalComplaints: number;
  agency: string;
}

export interface StatusResponse {
  totalComplaints: number;
  resolvedCount: number;
  inProgressCount: number;
  pendingCount: number;
  rejectedCount: number;
  closedCount: number;
  agency: string;
}

export interface AvgResolutionTimeResponse {
  averageDays: number;
  averageHours: number;
  minResolutionDays: number;
  maxResolutionDays: number;
  totalResolvedComplaints: number;
  agency: string;
}

export type ExportFormat = "csv" | "pdf";
