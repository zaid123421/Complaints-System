import { AxiosError } from "axios";
import client from "../axios/client";
import Cookies from "js-cookie";

export interface Complaint {
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
}

export interface ComplaintFilters {
  type?: string;
  status?: string;
  governorate?: string;
}

export const getComplaints = async (): Promise<Complaint[]> => {
  try {
    const token = Cookies.get("token");

    const res = await client.get("/complaints", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: 0,
        size: 10,
      },
    });

    return res.data.content;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    throw new Error(error.response?.data?.message || "فشل في جلب الشكاوي");
  }
};
