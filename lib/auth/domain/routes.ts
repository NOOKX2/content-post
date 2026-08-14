import type { Role } from "@prisma/client";
import { isAdminRole, isViewerRole } from "@/lib/auth/domain/roles";

export function getDefaultPathForRole(role: Role | string | undefined) {
  if (isAdminRole(role)) return "/admin";
  if (isViewerRole(role)) return "/dashboard";
  return "/create";
}
