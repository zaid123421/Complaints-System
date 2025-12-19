import client from "../axios/client";

export const adminLogin = async (data: { email: string; password: string }) => {
  const res = await client.post("/admin/login", data);
  return res.data;
};

export const employeeLogin = async (data: { email: string; password: string }) => {
  const res = await client.post("/employees/login", data);
  return res.data;
};
