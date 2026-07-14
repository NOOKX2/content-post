import type { Platform } from "./types";
import { CHANNEL_SELECT_OPTIONS } from "@/lib/content/channels";

export const CHANNELS = CHANNEL_SELECT_OPTIONS;

export const PLATFORMS: {
  id: Platform;
  label: string;
  shortLabel: string;
  color: string;
}[] = [
  { id: "facebook", label: "Facebook", shortLabel: "FB", color: "#1877F2" },
  { id: "instagram", label: "Instagram", shortLabel: "IG", color: "#E4405F" },
  { id: "tiktok", label: "TikTok", shortLabel: "TT", color: "#000000" },
  { id: "youtube", label: "YouTube", shortLabel: "YT", color: "#FF0000" },
];

export const TEAM_MEMBERS = [
  "โอปอ",
  "เกด",
  "มิ่ง",
  "เรย์",
  "ปิ่น",
] as const;

export const RESPONSIBILITIES = [
  "Model",
  "Videographer",
  "Props",
  "Producer",
  "Makeup",
] as const;

export const PRODUCTS = [
  "ยาหม่องสูตรคลาสสิค 8 กรัม",
  "ยาหม่องสูตรคลาสสิค 30 กรัม",
  "ยาหม่องสูตรคลาสสิค 50 กรัม",
  "ยาหม่องสูตรคลาสสิค 100 กรัม",
  "ยาน้ำมันสูตรคลาสสิค 3 cc",
  "ยาน้ำมันสูตรคลาสสิค 8 cc",
  "ยาน้ำมันสมุนไพร 50 กรัม",
  "ยาน้ำมันสมุนไพร 100 กรัม",
] as const;

export const FILMING_EQUIPMENT = [
  "DJI Osmo Pocket 3 - กล่อง",
  "DJI Osmo Pocket 3 - ซอง",
  "DJI Osmo Pocket 3 - พาวเวอร์แบงค์ใหญ่",
  "DJI Osmo Pocket 3 - พาวเวอร์แบงค์เล็ก",
  "DJI Osmo Pocket 3 - ขาตั้ง",
  "DJI Osmo Pocket 3 - สายชาร์จ",
  "DJI Mic 2 - กล่องไมค์",
  "DJI Mic 2 - ไมค์ 2 ตัว",
  "DJI Mic 2 - ตัวต่อ Phone",
  "DJI Mic 2 - ตัวต่อ Type-C",
  "DJI Mic 2 - ฟองน้ำกันลม",
  "DJI Mic 2 - สาย",
  "External Harddisk Sandisk 1 TB",
  "Flash Drive UGREEN",
] as const;

export const LOCATIONS = [
  "บ้านลาดพร้าว - ห้องนั่งเล่น",
  "บ้านลาดพร้าว - ครัว",
  "บ้านลาดพร้าว - สวนหน้าน้ำตก",
  "บ้านลาดพร้าว - โซนหมา",
  "ออฟฟิศ - ห้องไลฟ์",
  "ออฟฟิศ - ห้อง content",
  "ออฟฟิศ - ห้องประชุม",
  "ออฟฟิศ - ห้องแอดมิน",
  "ออฟฟิศ - ห้องซีอีโอ",
  "โกดัง - สต็อกสินค้า",
  "โกดัง - โซนแพ็คสินค้า",
  "โกดัง - หน้าป้ายโกดัง",
] as const;

export const CONTENT_CATEGORIES = [
  "Hero Video",
  "Recap / Teaser",
  "Innovation Video",
  "Lifestyle",
  "Product Review",
  "Behind the Scenes",
] as const;

/** วัตถุประสงค์ — ใช้ทั้ง Video (category) และ Picture (imageMeta.objective) */
export const CONTENT_OBJECTIVES = [
  "Awareness",
  "Product Education",
  "Promotion",
  "Review & Social Proof",
  "Lifestyle",
  "Entertainment",
  "Seasonal & Campaign",
  "Sale Support",
] as const;

/** @deprecated Use CONTENT_OBJECTIVES */
export const IMAGE_OBJECTIVES = CONTENT_OBJECTIVES;

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
  posting: { label: "กำลังโพสต์", color: "bg-amber-100 text-amber-700" },
  posted: { label: "โพสต์แล้ว", color: "bg-violet-100 text-violet-700" },
  rejected: { label: "ไม่อนุมัติ", color: "bg-red-100 text-red-700" },
};
