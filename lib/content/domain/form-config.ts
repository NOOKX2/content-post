import type { MediaType } from "@/lib/types";

export const MEDIA_FORM_CONFIG: Record<
  MediaType,
  {
    label: string;
    accentBorder: string;
    accentBg: string;
    accentText: string;
    locationLabel: string;
    locationOptional: boolean;
    productsOptional: boolean;
    itemsPrepareOptional: boolean;
    photographerLabel: string;
    showScript: boolean;
    showEditor: boolean;
  }
> = {
  video: {
    label: "วิดีโอ",
    accentBorder: "border-amber-600",
    accentBg: "bg-amber-50",
    accentText: "text-amber-900",
    locationLabel: "สถานที่ถ่าย",
    locationOptional: false,
    productsOptional: false,
    itemsPrepareOptional: false,
    photographerLabel: "ช่างภาพ/วิดีโอ",
    showScript: true,
    showEditor: true,
  },
  image: {
    label: "รูปภาพ",
    accentBorder: "border-pink-500",
    accentBg: "bg-pink-50",
    accentText: "text-pink-900",
    locationLabel: "สถานที่ถ่าย",
    locationOptional: true,
    productsOptional: true,
    itemsPrepareOptional: true,
    photographerLabel: "ผู้ถ่าย",
    showScript: false,
    showEditor: true,
  },
};
