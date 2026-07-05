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
    createdById: record.createdById,
    createdAt: record.createdAt.toISOString(),
  };
}

export function contentItemToFormData(content: ContentItem): ContentFormData {
  return {
    name: content.name,
    mediaType: content.mediaType,
    channel: content.channel,
    platforms: content.platforms,
    details: content.details,
    location: content.location,
    scheduledDate: content.scheduledDate,
    scheduledTime: content.scheduledTime,
    endTime: content.endTime ?? "",
    team: content.team,
    productsNeeded: content.productsNeeded,
    itemsToPrepare: content.itemsToPrepare,
    attachments: content.attachments,
    script: content.script,
    ideaCreator: content.ideaCreator,
    photographer: content.photographer,
    editor: content.editor,
    category: content.category,
    tags: content.tags,
  };
}

export function formDataToUpdateInput(
  data: ContentFormData
): Prisma.ContentUpdateInput {
  return {
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
