import crypto from "node:crypto";
import type { Content } from "@prisma/client";
import { getLineChannelSecret } from "@/lib/integrations/line/env";

export type LinePostbackAction = "approve" | "reject";

export type ParsedLinePostback = {
  action: LinePostbackAction;
  id: string;
  token?: string;
};

function postbackToken(contentId: string, status: string): string | undefined {
  const secret = getLineChannelSecret();
  if (!secret) return undefined;

  return crypto
    .createHmac("sha256", secret)
    .update(`${contentId}:${status}`)
    .digest("hex")
    .slice(0, 16);
}

export function buildLinePostbackData(
  action: LinePostbackAction,
  content: Pick<Content, "id" | "status">
): string {
  const token = postbackToken(content.id, content.status);
  if (!token) return `${action}:${content.id}`;
  return `${action}:${content.id}:${token}`;
}

export function parseLinePostback(data: string): ParsedLinePostback | null {
  const [action, id, token] = data.split(":");
  if (!id) return null;
  if (action !== "approve" && action !== "reject") return null;
  return { action, id, token: token || undefined };
}

/** False after the content has already left this round of LINE approval. */
export function isLineApprovalPostbackActive(
  content: Pick<Content, "id" | "status">,
  token?: string
): boolean {
  if (content.status !== "pending" && content.status !== "clip_pending") {
    return false;
  }

  const expected = postbackToken(content.id, content.status);
  if (!expected) return true;
  if (!token) return true;
  return token === expected;
}
