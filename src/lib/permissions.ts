export const ALL_PERMISSIONS = [
  "view",
  "edit",
  "delete",
  "generateReports",
  "createUsers",
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

export const RolePermissions: Record<string, Permission[]> = {
  PLATFORM_ADMIN: ["createUsers"],
  SUPERVISOR: ["view", "edit", "delete", "generateReports"],
  VIEWER: ["view", "edit", "delete"],
} as const;

export type Role = keyof typeof RolePermissions;

export const hasPermission = (permission: Permission, role?: Role) => {
  if (!role) return false;
  return RolePermissions[role]?.includes(permission);
};
