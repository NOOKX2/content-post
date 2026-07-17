import type { Role } from "@prisma/client";
import { isAdminRole } from "@/lib/auth/roles";

export function getDefaultPathForRole(role: Role | string | undefined) {
  return isAdminRole(role) ? "/admin" : "/create";
}
