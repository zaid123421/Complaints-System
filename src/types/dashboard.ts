export interface TopAgency {
  agencyName: string;
  agencyLabel: string;
  complaintCount: number;
}

export interface TopComplaintType {
  typeName: string;
  typeLabel: string;
  complaintCount: number;
}

export interface DashboardData {
  totalComplaints: number;
  resolvedComplaints: number;
  openComplaints: number;
  overdueComplaints: number;
  averageResolutionTimeDays: number;
  averageResolutionTimeHours: number;
  topAgenciesByComplaints: TopAgency[];
  topComplaintTypes: TopComplaintType[];
}
