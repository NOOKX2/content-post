import type { Session } from "next-auth";
import type { ContentStatus } from "@/lib/types";

type ContentAccess = {
  status: ContentStatus;
  createdById?: string | null;
};

function isOwner(session: Session, content: ContentAccess): boolean {
  return Boolean(
    content.createdById && content.createdById === session.user.id
  );
}

export function canEditContent(
  session: Session | null | undefined,
  content: ContentAccess
): boolean {
  if (!session?.user) return false;
  if (content.status === "posted" || content.status === "posting") return false;
  if (session.user.role === "ADMIN") return true;
  return isOwner(session, content);
}

export function canDeleteContent(
  session: Session | null | undefined,
  content: ContentAccess
): boolean {
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  if (content.status === "posted" || content.status === "posting") return false;
  return isOwner(session, content);
}

export function assertCanModifyContent(
  session: Session,
  content: ContentAccess,
  action: "edit" | "delete"
): string | null {
  if (action === "edit" && !canEditContent(session, content)) {
    return "Forbidden";
  }
  if (action === "delete" && !canDeleteContent(session, content)) {
    return "Forbidden";
  }
  return null;
}
