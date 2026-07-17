import type { Content } from "@prisma/client";
import type { ContentFormData } from "@/lib/types";
import { recordContentAuditLog } from "@/lib/collaboration/team-service";

const FIELD_LABELS: Record<string, string> = {
  name: "ชื่อ Content",
  details: "รายละเอียด",
  scheduledDate: "วันที่โพสต์",
  scheduledTime: "เวลาโพสต์",
  ideaFinishedDate: "คิดเสร็จ",
  shootDate: "นัดถ่าย",
  editFinishedDate: "ตัดเสร็จ",
  location: "สถานที่",
  team: "ผู้เข้าร่วม",
  script: "สคริป",
  platforms: "แพลตฟอร์ม",
  productsNeeded: "สินค้า",
  itemsToPrepare: "อุปกรณ์ประกอบฉาก",
  filmingEquipment: "อุปกรณ์ถ่าย",
  category: "วัตถุประสงค์",
  status: "สถานะ",
};

export async function writeContentUpdateAudit(input: {
  before: Content;
  afterForm: ContentFormData;
  changedFields: string[];
  actorId: string;
  actorName: string;
}): Promise<void> {
  if (input.changedFields.length === 0) return;

  const changes = input.changedFields.map((field) => {
    const beforeRecord = input.before as unknown as Record<string, unknown>;
    const afterRecord = input.afterForm as unknown as Record<string, unknown>;
    return {
      field: FIELD_LABELS[field] ?? field,
      before: beforeRecord[field],
      after: afterRecord[field],
    };
  });

  await recordContentAuditLog({
    contentId: input.before.id,
    actorId: input.actorId,
    actorName: input.actorName,
    action: "updated",
    changes,
  });
}

export async function writeContentStatusAudit(input: {
  contentId: string;
  actorId?: string | null;
  actorName: string;
  beforeStatus: string;
  afterStatus: string;
}): Promise<void> {
  await recordContentAuditLog({
    contentId: input.contentId,
    actorId: input.actorId,
    actorName: input.actorName,
    action: "status_changed",
    changes: [
      {
        field: "สถานะ",
        before: input.beforeStatus,
        after: input.afterStatus,
      },
    ],
  });
}
