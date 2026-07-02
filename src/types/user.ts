export interface Citizen {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Employee {
  id: number;
  id_employee?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  status: string;
}

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
