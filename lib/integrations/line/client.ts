import crypto from "node:crypto";
import {
  getLineChannelAccessToken,
  getLineChannelSecret,
} from "@/lib/integrations/line/env";

const LINE_API = "https://api.line.me/v2/bot";

export function verifyLineSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = getLineChannelSecret();
  if (!secret || !signature) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  const expected = Buffer.from(digest);
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

async function lineRequest(path: string, body: unknown): Promise<void> {
  const token = getLineChannelAccessToken();
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }

  const response = await fetch(`${LINE_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`LINE API ${path} ${response.status}: ${text}`);
  }
}

export async function pushLineMessages(
  to: string,
  messages: unknown[]
): Promise<void> {
  await lineRequest("/message/push", { to, messages });
}

export async function broadcastLineMessages(messages: unknown[]): Promise<void> {
  await lineRequest("/message/broadcast", { messages });
}

export async function replyLineMessages(
  replyToken: string,
  messages: unknown[]
): Promise<void> {
  await lineRequest("/message/reply", { replyToken, messages });
}
