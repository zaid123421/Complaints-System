import client from "../axios/client";
import type { LoginResponse } from "@/types/api";

export const adminLogin = async (data: { email: string; password: string }): Promise<LoginResponse> => {
  const res = await client.post<LoginResponse>("/admin/login", data);
  return res.data;
};

export const employeeLogin = async (data: { email: string; password: string }): Promise<LoginResponse> => {
  const res = await client.post<LoginResponse>("/employees/login", data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await client.post("/auth/logout");
};
