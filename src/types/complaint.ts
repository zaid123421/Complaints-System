export type ComplaintStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

/** Detail page UI uses "IN PROGRESS" with a space */
export type ComplaintStatusDetail =
  | "PENDING"
  | "IN PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export interface Attachment {
  id: number;
  originalFilename: string;
  downloadUrl: string;
}

export interface ComplaintListItem {
  id: number;
  status: string;
  complaintType: string;
  governorate: string;
  governmentAgency: string;
  location: string;
  description: string;
  solutionSuggestion: string;
  response: string | null;
  respondedAt: string | null;
  respondedById: number | null;
  respondedByName: string | null;
  attachments: string[];
  citizenId: number;
  citizenName: string;
  createdAt: string | null;
  updatedAt: string | null;
  trackingNumber: string;
}

export interface ComplaintDetail {
  id: number;
  status: ComplaintStatusDetail;
  complaintType: string;
  governorate: string;
  governmentAgency: string;
  location: string;
  description: string;
  response: string | null;
  attachments: Attachment[];
  solutionSuggestion: string;
}

export interface HistoryItem {
  id: number;
  actionType: string;
  actionDescription: string;
  actorId: number;
  actorName: string;
  actorEmail: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface InfoRequest {
  id: number;
  complaintId: number;
  requestedBy: {
    id: number;
    name: string;
    email: string;
  };
  requestMessage: string;
  status: string;
  requestedAt: string;
  respondedAt: string | null;
  responseMessage: string | null;
  attachments: Attachment[];
}

export interface ComplaintFilters {
  complaintType?: string;
  status?: string;
  governorate?: string;
  governmentAgency?: string;
  page?: number;
  size?: number;
}
