import type { Role } from "@prisma/client";

export function getDefaultPathForRole(role: Role | string | undefined) {
  return role === "ADMIN" ? "/admin" : "/create";
}
