import { AxiosError } from "axios";
import client from "../axios/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  ComplaintListItem,
  ComplaintDetail,
  ComplaintFilters,
  HistoryItem,
  InfoRequest,
} from "@/types/complaint";

export type { ComplaintListItem as Complaint };

export const filterComplaints = async (
  filters: ComplaintFilters
): Promise<PaginatedResponse<ComplaintListItem>> => {
  try {
    const res = await client.get<PaginatedResponse<ComplaintListItem>>("/complaints/filter", {
      params: filters,
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    throw new Error(error.response?.data?.message || "فشل في جلب الشكاوي");
  }
};

export const getComplaintByTracking = async (
  trackingNumber: string
): Promise<ComplaintListItem | null> => {
  try {
    const res = await client.get<ComplaintListItem>(
      `/complaints/tracking/${encodeURIComponent(trackingNumber.trim())}`
    );
    return res.data;
  } catch {
    return null;
  }
};

export const getComplaintById = async (id: string | number): Promise<ComplaintDetail> => {
  const res = await client.get<ComplaintDetail>(`/complaints/${id}`);
  return res.data;
};

export const getComplaintHistory = async (
  id: string | number,
  page = 0,
  size = 10
): Promise<PaginatedResponse<HistoryItem>> => {
  const res = await client.get<PaginatedResponse<HistoryItem>>(`/complaints/${id}/history`, {
    params: { page, size },
  });
  return res.data;
};

export const getInfoRequests = async (
  id: string | number
): Promise<{ content: InfoRequest[] }> => {
  const res = await client.get<{ content: InfoRequest[] }>(`/complaints/${id}/info-requests`);
  return res.data;
};

export const sendInfoRequest = async (
  id: string | number,
  message: string
): Promise<void> => {
  await client.post(`/complaints/${id}/info-requests`, { message });
};

export const respondToComplaint = async (
  id: string | number,
  status: string,
  response: string
): Promise<void> => {
  await client.put(`/complaints/${id}/respond`, null, {
    params: { status, response },
  });
};

export const downloadAttachment = async (url: string): Promise<Blob> => {
  const res = await client.get(url, { responseType: "blob", baseURL: "" });
  return res.data;
};

export const getAttachmentUrl = (complaintId: number, attachmentId: number): string => {
  const base = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  return `${base}/complaints/${complaintId}/attachments/${attachmentId}`;
};
