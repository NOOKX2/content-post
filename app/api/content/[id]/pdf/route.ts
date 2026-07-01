import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/content/api-auth";
import { toContentItem } from "@/lib/content/mappers";
import {
  generateContentPdf,
} from "@/lib/content/generate-content-pdf";
import { contentPdfFilename } from "@/lib/content/pdf-filename";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const record = await prisma.content.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const content = toContentItem(record);
    const pdf = await generateContentPdf(content);
    const filename = contentPdfFilename(content);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "ส่งออก PDF ไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
