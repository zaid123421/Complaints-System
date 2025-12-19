import Cookies from "js-cookie";
import { RolePermissions, Role, Permission } from "./permissions";

export function hasPermission(permission: Permission): boolean {
  const role = Cookies.get("role") as Role | undefined;
  if (!role) return false;

  return RolePermissions[role].includes(permission);
}
