import type { Content as PrismaContent, Prisma } from "@prisma/client";
import type {
  ContentItem,
  ContentFormData,
  ScriptRow,
  TeamRow,
  Platform,
  MediaType,
  ContentStatus,
  ImageMeta,
} from "@/lib/types";
import { EMPTY_IMAGE_META } from "@/lib/types";
import { normalizeScriptRow } from "@/lib/content/script";

function parseImageMeta(value: unknown): ImageMeta {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_IMAGE_META };
  }

  const meta = value as Partial<ImageMeta>;
  return {
    objective: meta.objective ?? "",
    headline: meta.headline ?? "",
    subHead: meta.subHead ?? "",
    callToAction: meta.callToAction ?? "",
    requiredElements: Array.isArray(meta.requiredElements)
      ? meta.requiredElements
      : [],
    workSizes: Array.isArray(meta.workSizes) ? meta.workSizes : [],
  };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value : [];
}

export function toContentItem(record: PrismaContent): ContentItem {
  return {
    id: record.id,
    contentId: record.contentId,
    name: record.name,
    mediaType: record.mediaType as MediaType,
    channel: record.channel,
    platforms: record.platforms as Platform[],
    details: record.details,
    location: toStringArray(record.location),
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    endTime: record.endTime ?? undefined,
    ideaFinishedDate: record.ideaFinishedDate ?? "",
    shootDate: record.shootDate ?? "",
    editFinishedDate: record.editFinishedDate ?? "",
    team: record.team as unknown as TeamRow[],
    productsNeeded: toStringArray(record.productsNeeded),
    itemsToPrepare: record.itemsToPrepare,
    filmingEquipment: toStringArray(record.filmingEquipment),
    attachments: toStringArray(record.attachments),
    script: (Array.isArray(record.script) ? record.script : []).map((row) =>
      normalizeScriptRow(row as unknown as ScriptRow)
    ),
    ideaCreator: record.ideaCreator,
    photographer: record.photographer,
    editor: record.editor,
    approver: record.approver ?? undefined,
    status: record.status as ContentStatus,
    category: record.category,
    tags: record.tags,
    imageMeta: parseImageMeta(record.imageMeta),
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
    ideaFinishedDate: content.ideaFinishedDate ?? "",
    shootDate: content.shootDate ?? "",
    editFinishedDate: content.editFinishedDate ?? "",
    team: content.team,
    productsNeeded: toStringArray(content.productsNeeded),
    itemsToPrepare: content.itemsToPrepare,
    filmingEquipment: toStringArray(content.filmingEquipment),
    attachments: toStringArray(content.attachments),
    script: content.script.map(normalizeScriptRow),
    ideaCreator: content.ideaCreator,
    photographer: content.photographer,
    editor: content.editor,
    category: content.category,
    tags: content.tags,
    imageMeta: content.imageMeta ?? { ...EMPTY_IMAGE_META },
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
    ideaFinishedDate: data.ideaFinishedDate || "",
    shootDate: data.shootDate || "",
    editFinishedDate: data.editFinishedDate || "",
    team: data.team as unknown as Prisma.InputJsonValue,
    productsNeeded: data.productsNeeded,
    itemsToPrepare: data.itemsToPrepare,
    filmingEquipment: data.filmingEquipment,
    attachments: data.attachments,
    script: data.script as unknown as Prisma.InputJsonValue,
    ideaCreator: data.ideaCreator,
    photographer: data.photographer,
    editor: data.editor,
    category: data.category,
    tags: data.tags,
    imageMeta: data.imageMeta as unknown as Prisma.InputJsonValue,
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
    ideaFinishedDate: data.ideaFinishedDate || "",
    shootDate: data.shootDate || "",
    editFinishedDate: data.editFinishedDate || "",
    team: data.team as unknown as Prisma.InputJsonValue,
    productsNeeded: data.productsNeeded,
    itemsToPrepare: data.itemsToPrepare,
    filmingEquipment: data.filmingEquipment,
    attachments: data.attachments,
    script: data.script as unknown as Prisma.InputJsonValue,
    ideaCreator: data.ideaCreator,
    photographer: data.photographer,
    editor: data.editor,
    category: data.category,
    tags: data.tags,
    imageMeta: data.imageMeta as unknown as Prisma.InputJsonValue,
    status: "pending",
    createdById,
  };
}
