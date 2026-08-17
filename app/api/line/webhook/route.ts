import { NextResponse } from "next/server";
import { verifyLineSignature } from "@/lib/integrations/line/client";
import { handleLineWebhookEvents } from "@/lib/integrations/line/handle-webhook";
import { getLineChannelSecret } from "@/lib/integrations/line/env";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  console.log("[line] webhook | POST", {
    hasSignature: Boolean(signature),
    bodyBytes: rawBody.length,
  });

  if (!getLineChannelSecret()) {
    console.error("[line] webhook | LINE_CHANNEL_SECRET is not configured");
    return NextResponse.json(
      { error: "LINE_CHANNEL_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!verifyLineSignature(rawBody, signature)) {
    console.error("[line] webhook | invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { events?: unknown };
  try {
    payload = rawBody ? (JSON.parse(rawBody) as { events?: unknown }) : {};
  } catch {
    // LINE Verify can send an empty or non-event body; still return 200.
    return NextResponse.json({ ok: true });
  }

  const events = Array.isArray(payload.events) ? payload.events : [];
  await handleLineWebhookEvents(
    events as Parameters<typeof handleLineWebhookEvents>[0]
  );

  return NextResponse.json({ ok: true });
}
