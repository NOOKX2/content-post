import { NextResponse } from "next/server";
import { requireN8nApiKey } from "@/lib/content/api-auth";
import { processDueScheduledContent } from "@/lib/content/process-due-scheduled";

export async function GET(request: Request) {
  const authResult = requireN8nApiKey(request);
  if ("error" in authResult) return authResult.error;

  const result = await processDueScheduledContent();
  return NextResponse.json(result);
}
