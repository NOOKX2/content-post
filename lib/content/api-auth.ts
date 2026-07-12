import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";

type ApiAuthUser = {
  id: string;
  name: string;
  role: string;
};

export type CreatorAuthResult =
  | { error: NextResponse }
  | { user: ApiAuthUser };

type SessionAuthResult =
  | { error: NextResponse }
  | { session: Session };

export function verifyN8nApiKey(request: Request): boolean {
  const key = process.env.N8N_API_KEY;
  if (!key) return false;
  return request.headers.get("x-api-key") === key;
}

export async function requireSession(): Promise<SessionAuthResult> {
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

export async function requireCreator(
  request: Request
): Promise<CreatorAuthResult> {
  if (verifyN8nApiKey(request)) {
    const { prisma } = await import("@/lib/prisma");
    const email =
      request.headers.get("x-user-email")?.trim() || "creator@idea.local";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        error: NextResponse.json(
          { error: `ไม่พบ user: ${email}` },
          { status: 401 }
        ),
      };
    }
    if (user.role !== "USER") {
      return {
        error: NextResponse.json(
          { error: "Admin ไม่สามารถสร้าง Content ได้" },
          { status: 403 }
        ),
      };
    }
    return { user: { id: user.id, name: user.name, role: user.role } };
  }

  const result = await requireSession();
  if ("error" in result) return { error: result.error };
  if (result.session.user.role === "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return {
    user: {
      id: result.session.user.id,
      name: result.session.user.name ?? "ผู้ใช้",
      role: result.session.user.role,
    },
  };
}
