import { NextResponse } from "next/server";
import { auth } from "@/auth";

export function verifyN8nApiKey(request: Request): boolean {
  const key = process.env.N8N_API_KEY;
  if (!key) return false;
  return request.headers.get("x-api-key") === key;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

export async function requireAdmin() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

export async function requireSessionOrN8n(request: Request) {
  if (verifyN8nApiKey(request)) {
    return { n8n: true as const };
  }
  return requireSession();
}

export function requireN8nApiKey(request: Request) {
  if (!verifyN8nApiKey(request)) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { n8n: true as const };
}
