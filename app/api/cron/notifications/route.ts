import { NextResponse } from "next/server";
import { requireN8nApiKey } from "@/lib/content/api-auth";
import { processAllReminders } from "@/lib/notifications/reminders";

export async function POST(request: Request) {
  const authResult = requireN8nApiKey(request);
  if ("error" in authResult) return authResult.error;

  try {
    const result = await processAllReminders();
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
