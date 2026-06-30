import type { Platform } from "./types";

export const CHANNELS = [
  "Official",
  "ลูกสาว",
  "สายพี่ป๋อง",
  "ของชำร่วย",
  "วังน้ำเขียวฟาร์ม",
  "Hero Product",
] as const;

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
