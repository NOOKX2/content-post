import type { Platform } from "./types";
import { CONTENT_CHANNELS } from "@/lib/content/content-id";

export const CHANNELS = CONTENT_CHANNELS;

export const PLATFORMS: {
  id: Platform;
  label: string;
  shortLabel: string;
  color: string;
}[] = [
  { id: "facebook", label: "Facebook", shortLabel: "FB", color: "#1877F2" },
  { id: "instagram", label: "Instagram", shortLabel: "IG", color: "#E4405F" },
  { id: "tiktok", label: "TikTok", shortLabel: "TT", color: "#000000" },
  { id: "line", label: "LINE", shortLabel: "LI", color: "#06C755" },
  { id: "lemon8", label: "Lemon8", shortLabel: "L8", color: "#FFF100" },
  { id: "youtube", label: "YouTube", shortLabel: "YT", color: "#FF0000" },
];

export const TEAM_MEMBERS = [
  "Laura Power",
  "สมชาย ใจดี",
  "มานี มีสุข",
  "วิชัย สร้างสรรค์",
  "พิมพ์ใจ ถ่ายทำ",
  "กนก ตัดต่อ",
] as const;

export const RESPONSIBILITIES = [
  "Presenter",
  "Camera",
  "Lighting",
  "Props",
  "Makeup",
  "Script",
  "Director",
] as const;

export const PRODUCTS = [
  "Hero Serum",
  "Herbal Tea Set",
  "Farm Fresh Honey",
  "Wellness Bundle",
  "Gift Set",
] as const;

export const FILMING_EQUIPMENT = [
  "Camera",
  "Lighting",
  "Microphone",
  "Tripod",
  "Gimbal",
  "Drone",
  "Reflector",
  "Backdrop",
  "Props",
] as const;

export const LOCATIONS = [
  "Studio A",
  "Farm Location",
  "Office",
  "Outdoor",
  "Kitchen Set",
] as const;

export const CONTENT_CATEGORIES = [
  "Hero Video",
  "Recap / Teaser",
  "Innovation Video",
  "Lifestyle",
  "Product Review",
  "Behind the Scenes",
] as const;

export const IMAGE_OBJECTIVES = [
  "Brand Awareness",
  "Product Launch",
  "Promotion / Sale",
  "Education",
  "Engagement",
  "Event Announcement",
] as const;

export const IMAGE_REQUIRED_ELEMENTS = [
  "Logo",
  "Product",
  "ราคา / โปรโมชัน",
  "CTA",
  "Hashtag",
  "QR Code",
  "ข้อความหลัก",
] as const;

export const IMAGE_WORK_SIZES = [
  "1:1 (Feed)",
  "4:5 (Portrait)",
  "9:16 (Story/Reels)",
  "16:9 (Landscape)",
  "Cover Photo",
] as const;

export const STATUS_LABELS: Record<
  import("./types").ContentStatus,
  { label: string; color: string }
> = {
  draft: { label: "แบบร่าง", color: "bg-zinc-100 text-zinc-600" },
  pending: { label: "รออนุมัติ", color: "bg-amber-100 text-amber-700" },
  approved: { label: "อนุมัติแล้ว", color: "bg-blue-100 text-blue-700" },
  scheduled: { label: "กำหนดการแล้ว", color: "bg-blue-100 text-blue-700" },
  posted: { label: "โพสต์แล้ว", color: "bg-violet-100 text-violet-700" },
  rejected: { label: "ไม่อนุมัติ", color: "bg-red-100 text-red-700" },
};
