import type { Role } from "@prisma/client";

export const TEAM_ROLES: Role[] = ["ADMIN", "EDITOR", "DESIGNER", "USER"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  DESIGNER: "Designer",
  USER: "Creator",
};

export function isAdminRole(role: Role | string | undefined): boolean {
  return role === "ADMIN";
}

export function isCreatorRole(role: Role | string | undefined): boolean {
  return role === "USER" || role === "EDITOR" || role === "DESIGNER";
}

export function getRoleLabel(role: Role | string | undefined): string {
  if (!role) return "Creator";
  return ROLE_LABELS[role as Role] ?? String(role);
}
