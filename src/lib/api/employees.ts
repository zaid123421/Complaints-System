import { AxiosError } from "axios";
import client from "../axios/client";
import type { EmployeeForm } from "@/types/user";

export type { EmployeeForm };

export const addEmployee = async (employee: EmployeeForm) => {
  try {
    const res = await client.post("/employees", employee);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    throw new Error(error.response?.data?.message || "فشل في إضافة الموظف");
  }
};
