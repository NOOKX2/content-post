import type { Platform } from "./types";
import { CHANNEL_SELECT_OPTIONS } from "@/lib/content/posting/channels";

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
  { id: "line", label: "LINE", shortLabel: "LINE", color: "#06C755" },
  { id: "lemon8", label: "Lemon8", shortLabel: "L8", color: "#FFC700" },
  { id: "youtube", label: "YouTube", shortLabel: "YT", color: "#FF0000" },
];

export const TEAM_MEMBERS = [
  "โอปอ",
  "เกด",
  "มิ้ง",
  "เลย์",
  "ปิ่น",
] as const;

export const RESPONSIBILITIES = [
  "นักแสดง",
  "ช่างภาพวิดีโอ",
  "ฝ่ายอุปกรณ์ประกอบฉาก",
  "ผู้อำนวยการสร้าง/ผู้ควบคุมการผลิต",
  "ช่างแต่งหน้า",
  "ช่างทำผม",
] as const;

export const PRODUCTS = [
  "ยาหม่องสูตรคลาสสิค 8 กรัม",
  "ยาหม่องสูตรคลาสสิค 30 กรัม",
  "ยาหม่องสูตรคลาสสิค 50 กรัม",
  "ยาหม่องสูตรคลาสสิค 100 กรัม",
  "ยาหม่องสมุนไพร 50 กรัม",
  "ยาหม่องสมุนไพร 100 กรัม",
  "ยาหม่องเสลดพังพอน 50 กรัม",
  "ยาหม่องเสลดพังพอน 100 กรัม",
  "ยาหม่องแอลพี 50 กรัม",
  "ยาหม่องแอลพี 100 กรัม",
  "ยาน้ำมันสูตรคลาสสิค 3 ซีซี",
  "ยาน้ำมันสูตรคลาสสิค 8 ซีซี",
  "ยาน้ำมันสูตรคลาสสิค 22 ซีซี",
  "ยาน้ำมันสูตรคลาสสิค 30 ซีซี",
  "ยาน้ำมันสูตรคลาสสิค 55 ซีซี",
  "ยาน้ำมันสูตรคลาสสิค 60 ซีซี",
] as const;

export const FILMING_EQUIPMENT = [
  "กล้อง 1 อัน",
  "ปลอกใส่กล้อง 1 อัน",
  "พาวเวอร์แบงค์อันใหญ่ 1 อัน",
  "พาวเวอร์แบงค์อันเล็ก 1 อัน",
  "ขาตั้งกล้อง 1 อัน",
  "กระเป๋าใส่กล้อง 1 อัน",
  "กล่องไมค์",
  "ไมค์ 2 ตัว",
  "ตัวเชื่อมกับมือถือ 1 อัน",
  "ตัวเชื่อมหัว Type C 1 อัน",
  "ที่กรองเสียง 4 อัน",
  "สายเชื่อม 1 อัน",
  "กระเป๋าใส่ไมค์ 1 อัน",
  "External Harddisk Sandisk 1 TB",
  "Flash Drive UGREEN",
] as const;

export const LOCATIONS = [
  "บ้านลาดพร้าว - ห้องนั่งเล่น",
  "บ้านลาดพร้าว - โซนครัว",
  "บ้านลาดพร้าว - ลานหน้าน้ำตก",
  "บ้านลาดพร้าว - โซนสุนัข",
  "ออฟฟิศ - ห้องไลฟ์",
  "ออฟฟิศ - ห้องคอนเทนต์",
  "ออฟฟิศ - ห้องประชุม",
  "ออฟฟิศ - ห้องแอดมิน",
  "ออฟฟิศ - ห้องซีอีโอ",
  "โกดัง - สต๊อคสินค้า",
  "โกดัง - โซนแพ็คสินค้า",
  "โกดัง - ป้ายหน้าโกดัง",
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
  pending: { label: "รออนุมัติแนวคิด", color: "bg-amber-100 text-amber-700" },
  idea_approved: {
    label: "อนุมัติแนวคิดแล้ว — รออัปโหลดคลิป",
    color: "bg-sky-100 text-sky-700",
  },
  clip_pending: {
    label: "รออนุมัติคลิป",
    color: "bg-orange-100 text-orange-700",
  },
  approved: { label: "อนุมัติแล้ว", color: "bg-blue-100 text-blue-700" },
  scheduled: { label: "กำหนดการแล้ว", color: "bg-blue-100 text-blue-700" },
  posting: { label: "กำลังโพสต์", color: "bg-amber-100 text-amber-700" },
  posted: { label: "โพสต์แล้ว", color: "bg-violet-100 text-violet-700" },
  post_failed: { label: "โพสต์ไม่สำเร็จ", color: "bg-red-100 text-red-700" },
  rejected: { label: "ไม่อนุมัติ", color: "bg-red-100 text-red-700" },
};
