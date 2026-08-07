import { NextResponse } from "next/server";
import { requireN8nApiKey } from "@/lib/shared/api-auth";
import { processDueScheduledContent } from "@/lib/content/posting/process-due";

export async function GET(request: Request) {
  const authResult = requireN8nApiKey(request);
  if ("error" in authResult) return authResult.error;

  const result = await processDueScheduledContent();
  return NextResponse.json(result);
}
