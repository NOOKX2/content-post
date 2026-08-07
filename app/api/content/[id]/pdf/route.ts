import { NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { requireSession } from "@/lib/shared/api-auth";
import { toContentItem } from "@/lib/content/data/mappers";
import { generateContentPdf } from "@/lib/content/pdf/generate";
import { contentPdfFilename } from "@/lib/content/pdf/filename";

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
    console.log("[content-pdf] generating", {
      id: content.id,
      contentId: content.contentId,
      name: content.name,
      mediaType: content.mediaType,
      status: content.status,
    });

    const pdf = await generateContentPdf(content);
    const filename = contentPdfFilename(content);

    console.log("[content-pdf] success", {
      contentId: content.contentId,
      bytes: pdf.length,
      filename,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[content-pdf] ERROR", {
      id,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : String(error),
    });
    return NextResponse.json(
      {
        error: "ส่งออก PDF ไม่สำเร็จ กรุณาลองใหม่",
        details:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { value: String(error) },
      },
      { status: 500 }
    );
  }
}
