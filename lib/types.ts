export type MediaType = "video" | "image";

export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "scheduled"
  | "posted"
  | "rejected";

export type Platform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "line"
  | "lemon8"
  | "youtube";

export interface ScriptRow {
  id: string;
  duration: string;
  action: string;
  dialogue: string;
  notes: string;
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
  team: TeamRow[];
  productsNeeded: string[];
  itemsToPrepare: string;
  attachments: string[];
  script: ScriptRow[];
  ideaCreator: string;
  photographer: string;
  editor: string;
  approver?: string;
  status: ContentStatus;
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
  team: TeamRow[];
  productsNeeded: string[];
  itemsToPrepare: string;
  attachments: string[];
  script: ScriptRow[];
  ideaCreator: string;
  photographer: string;
  editor: string;
  category: string;
  tags: string[];
  imageMeta: ImageMeta;
}
