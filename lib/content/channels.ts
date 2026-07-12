import type { Platform } from "@/lib/types";

/** @deprecated ใช้ /api/posting-channels แทน — เก็บไว้สำหรับ fallback */
export const CHANNEL_SELECT_OPTIONS: {
  value: string;
  label: string;
}[] = [];

export function getAvailablePlatformsForChannel(_channelId: string): Platform[] {
  return [];
}
