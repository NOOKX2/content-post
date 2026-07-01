import type { Content as PrismaContent, Prisma } from "@prisma/client";
import type {
  ContentItem,
  ContentFormData,
  ScriptRow,
  TeamRow,
  Platform,
  MediaType,
  ContentStatus,
} from "@/lib/types";

export function toContentItem(record: PrismaContent): ContentItem {
  return {
    id: record.id,
    contentId: record.contentId,
    name: record.name,
    mediaType: record.mediaType as MediaType,
    channel: record.channel,
    platforms: record.platforms as Platform[],
    details: record.details,
    location: record.location,
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    endTime: record.endTime ?? undefined,
    team: record.team as unknown as TeamRow[],
    productsNeeded: record.productsNeeded,
    itemsToPrepare: record.itemsToPrepare,
    attachments: record.attachments,
    script: record.script as unknown as ScriptRow[],
    ideaCreator: record.ideaCreator,
    photographer: record.photographer,
    editor: record.editor,
    approver: record.approver ?? undefined,
    status: record.status as ContentStatus,
    category: record.category,
    tags: record.tags,
    createdAt: record.createdAt.toISOString(),
  };
}

export function formDataToCreateInput(
  data: ContentFormData,
  contentId: string,
  createdById?: string
): Prisma.ContentUncheckedCreateInput {
  return {
    contentId,
    name: data.name.trim(),
    mediaType: data.mediaType,
    channel: data.channel,
    platforms: data.platforms,
    details: data.details,
    location: data.location,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
    endTime: data.endTime || null,
    team: data.team as unknown as Prisma.InputJsonValue,
    productsNeeded: data.productsNeeded,
    itemsToPrepare: data.itemsToPrepare,
    attachments: data.attachments,
    script: data.script as unknown as Prisma.InputJsonValue,
    ideaCreator: data.ideaCreator,
    photographer: data.photographer,
    editor: data.editor,
    category: data.category,
    tags: data.tags,
    status: "pending",
    createdById,
  };
}
