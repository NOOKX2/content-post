import type { MediaType } from "@/lib/types";

/** Image and graphic share the still-media workflow (no video production steps). */
export function isStillMedia(mediaType: MediaType): boolean {
  return mediaType === "image" || mediaType === "graphic";
}

export function isVideoMedia(mediaType: MediaType): boolean {
  return mediaType === "video";
}
