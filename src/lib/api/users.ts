import client from "../axios/client";
import type { PaginatedResponse } from "@/types/api";
import type { Citizen, Employee } from "@/types/user";

export const getCitizens = async (
  page: number,
  size: number
): Promise<PaginatedResponse<Citizen>> => {
  const res = await client.get<PaginatedResponse<Citizen>>("/citizens", {
    params: { page, size },
  });
  return res.data;
};

export const searchCitizens = async (
  name: string,
  page: number,
  size: number
): Promise<PaginatedResponse<Citizen>> => {
  const res = await client.get<PaginatedResponse<Citizen>>("/citizens/search", {
    params: { name, page, size },
  });
  return res.data;
};

export const getEmployees = async (): Promise<Employee[]> => {
  const res = await client.get<Employee[]>("/employees");
  return res.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await client.delete(`/employees/${id}`);
};

export const resetPassword = async (userId: number, newPassword: string): Promise<void> => {
  await client.put("/password/reset", { userId, newPassword });
};

export const suspendCitizen = async (id: number, reason: string): Promise<void> => {
  await client.put(`/admin/users/citizens/${id}/suspend`, { reason });
};

export const unsuspendCitizen = async (id: number): Promise<void> => {
  await client.put(`/admin/users/citizens/${id}/unsuspend`);
};

export const updateEmployeeRole = async (id: number, roleName: string): Promise<void> => {
  await client.put(`/admin/users/employees/${id}/role`, null, {
    params: { roleName },
  });
};

export const updateEmployeeStatus = async (
  id: number,
  action: "enable" | "disable"
): Promise<void> => {
  await client.put(`/admin/users/employees/${id}/${action}`);
};
