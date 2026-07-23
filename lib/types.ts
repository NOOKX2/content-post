export type MediaType = "video" | "image";

export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "scheduled"
  | "posting"
  | "posted"
  | "post_failed"
  | "rejected";

export type Platform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube";

export interface ScriptRow {
  id: string;
  startTime: string;
  endTime: string;
  /** @deprecated Prefer startTime/endTime. Kept for legacy script rows. */
  duration?: string;
  action: string;
  dialogue: string;
  notes: string;
  /** Reference image URL for this scene */
  imageUrl?: string;
}

export interface TeamRow {
  id: string;
  participant: string;
  responsibility: string;
}

export interface ImageMeta {
  objective: string;
  headline: string;
  subHead: string;
  callToAction: string;
  requiredElements: string[];
  workSizes: string[];
}

export const EMPTY_IMAGE_META: ImageMeta = {
  objective: "",
  headline: "",
  subHead: "",
  callToAction: "",
  requiredElements: [],
  workSizes: [],
};

export interface ContentItem {
  id: string;
  contentId: string;
  name: string;
  mediaType: MediaType;
  channel: string;
  platforms: Platform[];
  details: string;
  location: string[];
  scheduledDate: string;
  scheduledTime: string;
  endTime?: string;
  ideaFinishedDate: string;
  shootDate: string;
  editFinishedDate: string;
  team: TeamRow[];
  productsNeeded: string[];
  itemsToPrepare: string;
  filmingEquipment: string[];
  attachments: string[];
  script: ScriptRow[];
  ideaCreator: string;
  photographer: string;
  editor: string;
  approver?: string;
  status: ContentStatus;
  postError?: string;
  category: string;
  tags: string[];
  imageMeta?: ImageMeta;
  createdById?: string | null;
  createdAt: string;
}

export interface ContentFormData {
  name: string;
  mediaType: MediaType;
  channel: string;
  platforms: Platform[];
  details: string;
  location: string[];
  scheduledDate: string;
  scheduledTime: string;
  endTime: string;
  ideaFinishedDate: string;
  shootDate: string;
  editFinishedDate: string;
  team: TeamRow[];
  productsNeeded: string[];
  itemsToPrepare: string;
  filmingEquipment: string[];
  attachments: string[];
  script: ScriptRow[];
  ideaCreator: string;
  photographer: string;
  editor: string;
  category: string;
  tags: string[];
  imageMeta: ImageMeta;
}
