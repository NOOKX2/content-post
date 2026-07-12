import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/content/api-auth";
import { deletePostingChannel } from "@/lib/content/posting-channels";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const channel = await deletePostingChannel(id);
    return NextResponse.json({ success: true, channel });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "ไม่สามารถลบช่องได้",
      },
      { status: 400 }
    );
  }
}
