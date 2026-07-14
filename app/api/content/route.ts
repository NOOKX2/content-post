import { NextResponse } from "next/server";
import { requireCreator } from "@/lib/content/api-auth";
import { createContentRecord } from "@/lib/content/create-content-record";
import type { ContentFormData } from "@/lib/types";
import { EMPTY_IMAGE_META } from "@/lib/types";

function normalizeContentPayload(body: Partial<ContentFormData>): ContentFormData {
  return {
    name: body.name ?? "",
    mediaType: body.mediaType ?? "video",
    channel: body.channel ?? "",
    platforms: body.platforms ?? [],
    details: body.details ?? "",
    location: body.location ?? [],
    scheduledDate: body.scheduledDate ?? "",
    scheduledTime: body.scheduledTime ?? "",
    endTime: body.endTime ?? "",
    ideaFinishedDate: body.ideaFinishedDate ?? "",
    shootDate: body.shootDate ?? "",
    editFinishedDate: body.editFinishedDate ?? "",
    team: body.team ?? [],
    productsNeeded: body.productsNeeded ?? [],
    itemsToPrepare: body.itemsToPrepare ?? "",
    filmingEquipment: body.filmingEquipment ?? [],
    attachments: body.attachments ?? [],
    script: body.script ?? [],
    ideaCreator: body.ideaCreator ?? "",
    photographer: body.photographer ?? "",
    editor: body.editor ?? "",
    category: body.category ?? "",
    tags: body.tags ?? [],
    imageMeta: body.imageMeta ?? { ...EMPTY_IMAGE_META },
  };
}

export async function POST(request: Request) {
  const authResult = await requireCreator(request);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = normalizeContentPayload(
      (await request.json()) as Partial<ContentFormData>
    );
    const content = await createContentRecord(body, user.id, user.name);
    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "สร้าง Content ไม่สำเร็จ",
      },
      { status: 400 }
    );
  }
}
