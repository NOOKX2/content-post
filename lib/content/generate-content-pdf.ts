import path from "path";
import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";
import type { ContentItem, Platform } from "@/lib/types";
import { PLATFORMS, STATUS_LABELS } from "@/lib/constants";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import { formatScriptDuration } from "@/lib/content/script";
import { formatLocations, formatThaiDate } from "@/lib/utils";

const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT_REGULAR = "Sarabun";
const FONT_BOLD = "Sarabun-Bold";

type Doc = PDFKit.PDFDocument;

function fontPaths() {
  const base = path.join(process.cwd(), "public/fonts");
  return {
    regular: path.join(base, "Sarabun-Regular.ttf"),
    bold: path.join(base, "Sarabun-SemiBold.ttf"),
  };
}

function formatPlatforms(platforms: Platform[]): string {
  return platforms
    .map((p) => PLATFORMS.find((x) => x.id === p)?.label ?? p)
    .join(", ");
}

function ensureSpace(doc: Doc, height: number) {
  if (doc.y + height > doc.page.height - MARGIN - 30) {
    doc.addPage();
  }
}

function sectionTitle(doc: Doc, title: string) {
  ensureSpace(doc, 36);
  doc.moveDown(0.4);
  doc.font(FONT_BOLD).fontSize(13).fillColor("#1d1d1f").text(title);
  doc.moveDown(0.25);
  doc
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .stroke();
  doc.moveDown(0.45);
}

function fieldRow(doc: Doc, label: string, value: string) {
  if (!value.trim()) return;

  const valueWidth = CONTENT_WIDTH - 125;
  const valueHeight = doc.heightOfString(value, { width: valueWidth });
  ensureSpace(doc, Math.max(18, valueHeight) + 8);

  const y = doc.y;
  doc
    .font(FONT_BOLD)
    .fontSize(10)
    .fillColor("#7a7a7a")
    .text(label, MARGIN, y, { width: 115 });
  doc
    .font(FONT_REGULAR)
    .fontSize(11)
    .fillColor("#1d1d1f")
    .text(value, MARGIN + 125, y, { width: valueWidth });

  doc.y = y + Math.max(16, valueHeight) + 8;
}

function paragraph(doc: Doc, text: string) {
  ensureSpace(doc, 24);
  doc
    .font(FONT_REGULAR)
    .fontSize(11)
    .fillColor("#333333")
    .text(text, { width: CONTENT_WIDTH, align: "left" });
  doc.moveDown(0.4);
}

function bulletRows(doc: Doc, rows: string[]) {
  for (const row of rows) {
    ensureSpace(doc, 20);
    doc.font(FONT_REGULAR).fontSize(11).fillColor("#1d1d1f").text(`• ${row}`, {
      width: CONTENT_WIDTH,
    });
    doc.moveDown(0.15);
  }
}

function scriptTable(doc: Doc, content: ContentItem) {
  for (const row of content.script) {
    ensureSpace(doc, 48);
    doc
      .font(FONT_BOLD)
      .fontSize(10)
      .fillColor("#7a7a7a")
      .text(formatScriptDuration(row) || "—", { continued: false });
    doc.moveDown(0.15);
    if (row.action) {
      doc.font(FONT_REGULAR).fontSize(11).fillColor("#1d1d1f").text(row.action, {
        width: CONTENT_WIDTH,
      });
      doc.moveDown(0.1);
    }
    if (row.dialogue) {
      doc.font(FONT_REGULAR).fontSize(11).fillColor("#333333").text(row.dialogue, {
        width: CONTENT_WIDTH,
      });
      doc.moveDown(0.1);
    }
    if (row.notes) {
      doc.font(FONT_REGULAR).fontSize(10).fillColor("#7a7a7a").text(row.notes, {
        width: CONTENT_WIDTH,
      });
    }
    doc.moveDown(0.35);
  }
}

export function generateContentPdf(content: ContentItem): Promise<Buffer> {
  const fonts = fontPaths();
  const status = STATUS_LABELS[content.status];
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const isVideo = content.mediaType === "video";

  const scheduleLabel = content.scheduledDate
    ? `${formatThaiDate(content.scheduledDate)}${
        content.scheduledTime ? ` · ${content.scheduledTime}` : ""
      }`
    : "";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: MARGIN,
      size: "A4",
      bufferPages: true,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont(FONT_REGULAR, fonts.regular);
    doc.registerFont(FONT_BOLD, fonts.bold);

    doc.font(FONT_BOLD).fontSize(11).fillColor("#0066cc").text("iDea Content");
    doc
      .font(FONT_REGULAR)
      .fontSize(9)
      .fillColor("#7a7a7a")
      .text("รายละเอียด Content");
    doc.moveDown(0.8);

    doc
      .font(FONT_BOLD)
      .fontSize(22)
      .fillColor("#1d1d1f")
      .text(content.name, { width: CONTENT_WIDTH });
    doc.moveDown(0.35);
    doc
      .font(FONT_REGULAR)
      .fontSize(11)
      .fillColor("#7a7a7a")
      .text(`#${content.contentId}  ·  ${status.label}  ·  ${mediaConfig.label}`);

    if (content.channel) {
      doc.moveDown(0.15);
      doc.text(`ช่องที่ลง: ${content.channel}`);
    }
    if (content.platforms.length > 0) {
      doc.text(`แพลตฟอร์ม: ${formatPlatforms(content.platforms)}`);
    }

    sectionTitle(doc, "ข้อมูลหลัก");
    if (scheduleLabel) fieldRow(doc, "วันเวลา", scheduleLabel);
    if (content.location.length > 0) {
      fieldRow(doc, "สถานที่", formatLocations(content.location));
    }
    if (content.category) fieldRow(doc, "หมวดหมู่", content.category);
    if (!isVideo && content.imageMeta?.objective) {
      fieldRow(doc, "วัตถุประสงค์", content.imageMeta.objective);
    }
    if (content.approver) fieldRow(doc, "อนุมัติโดย", content.approver);

    if (content.details) {
      sectionTitle(doc, "รายละเอียด");
      paragraph(doc, content.details);
    }

    if (!isVideo && content.imageMeta) {
      const meta = content.imageMeta;
      const hasImageBrief =
        meta.headline ||
        meta.subHead ||
        meta.callToAction ||
        meta.requiredElements.length > 0 ||
        meta.workSizes.length > 0;

      if (hasImageBrief) {
        sectionTitle(doc, "ข้อความบนภาพ & องค์ประกอบ");
        if (meta.headline) fieldRow(doc, "Headline", meta.headline);
        if (meta.subHead) fieldRow(doc, "Sub Head", meta.subHead);
        if (meta.callToAction) fieldRow(doc, "Call to Action", meta.callToAction);
        if (meta.requiredElements.length > 0) {
          fieldRow(doc, "องค์ประกอบที่ต้องมี", meta.requiredElements.join(", "));
        }
        if (meta.workSizes.length > 0) {
          fieldRow(doc, "ขนาดงาน", meta.workSizes.join(", "));
        }
      }
    }

    if (content.ideaCreator || content.photographer || content.editor) {
      sectionTitle(doc, "ผู้สร้าง content");
      if (content.ideaCreator) {
        fieldRow(doc, "ผู้คิด Content", content.ideaCreator);
      }
      if (content.photographer) {
        fieldRow(doc, mediaConfig.photographerLabel, content.photographer);
      }
      if (content.editor) fieldRow(doc, "ตัดต่อ", content.editor);
    }

    if (content.team.length > 0) {
      sectionTitle(doc, "ผู้ร่วมงาน");
      bulletRows(
        doc,
        content.team.map((r) => `${r.participant} — ${r.responsibility}`)
      );
    }

    if (isVideo && content.script.length > 0) {
      sectionTitle(doc, "สคริป");
      scriptTable(doc, content);
    }

    if (
      isVideo &&
      (content.productsNeeded.length > 0 ||
        content.itemsToPrepare ||
        (content.filmingEquipment?.length ?? 0) > 0)
    ) {
      sectionTitle(doc, "สิ่งที่ต้องเตรียม");
      if (content.productsNeeded.length > 0) {
        fieldRow(doc, "สินค้าที่ต้องเตรียม", content.productsNeeded.join(", "));
      }
      if (content.itemsToPrepare) {
        fieldRow(doc, "อุปกรณ์ประกอบฉากที่ต้องเตรียม", content.itemsToPrepare);
      }
      if ((content.filmingEquipment?.length ?? 0) > 0) {
        fieldRow(
          doc,
          "อุปกรณ์ถ่ายที่ต้องเตรียม",
          content.filmingEquipment?.join(", ") ?? ""
        );
      }
    }

    if (content.attachments.length > 0) {
      sectionTitle(doc, isVideo ? "ไฟล์แนบ / ลิงก์" : "แนบตัวอย่าง");
      bulletRows(doc, content.attachments);
    }

    if (content.tags.length > 0) {
      sectionTitle(doc, "แท็ก");
      paragraph(doc, content.tags.join(", "));
    }

    const exportedAt = new Date().toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
    });
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .font(FONT_REGULAR)
        .fontSize(8)
        .fillColor("#7a7a7a")
        .text(
          `ส่งออกเมื่อ ${exportedAt}  ·  หน้า ${i + 1} / ${pages.count}`,
          MARGIN,
          doc.page.height - 35,
          { width: CONTENT_WIDTH, align: "center", lineBreak: false }
        );
    }

    doc.end();
  });
}
