import type { Role } from "@prisma/client";

export const TEAM_ROLES: Role[] = ["USER", "EDITOR", "ADMIN"];

export const TEAM_MEMBER_LIMIT = 10;

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  DESIGNER: "Editor",
  USER: "Viewer",
};

export type AssignableRole = "USER" | "EDITOR" | "ADMIN";

export function isAdminRole(role: Role | string | undefined): boolean {
  return role === "ADMIN";
}

export function isEditorRole(role: Role | string | undefined): boolean {
  return role === "EDITOR" || role === "DESIGNER";
}

export function isViewerRole(role: Role | string | undefined): boolean {
  return role === "USER";
}

export function isCreatorRole(role: Role | string | undefined): boolean {
  return isEditorRole(role) || isViewerRole(role);
}

export function toAssignableRole(role: Role | string | undefined): AssignableRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "EDITOR" || role === "DESIGNER") return "EDITOR";
  return "USER";
}

export function getRoleLabel(role: Role | string | undefined): string {
  if (!role) return ROLE_LABELS.USER;
  return ROLE_LABELS[role as Role] ?? String(role);
}
