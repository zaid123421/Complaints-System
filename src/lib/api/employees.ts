import { AxiosError } from "axios";
import client from "../axios/client";
import Cookies from "js-cookie";

export interface EmployeeForm {
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  dateOfHire: string;
  roleName: string;
  status: string;
  governmentAgencyType: string;
}

export const addEmployee = async (employee: EmployeeForm) => {
  try {
    const token = Cookies.get("token");

    const res = await client.post("/employees", employee, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    throw new Error(error.response?.data?.message || "فشل في إضافة الموظف");
  }
};
