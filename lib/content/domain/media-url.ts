import type { MediaType } from "@/lib/types";
import { isStillMedia } from "@/lib/content/domain/media-type";

const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

/** Direct video file URL (playable in HTML5 video or Buffer). */
export function isVideoMediaUrl(url: string): boolean {
  return VIDEO_EXT.test(url.split("?")[0]);
}

export function isImageMediaUrl(url: string): boolean {
  return IMAGE_EXT.test(url.split("?")[0]);
}

/** Video attachment for form validation — file upload or external link. */
export function isVideoAttachmentUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  const path = trimmed.split("?")[0];
  if (IMAGE_EXT.test(path)) return false;
  if (VIDEO_EXT.test(path)) return true;

  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

export function toAbsolutePublicUrl(
  url: string,
  baseUrl: string
): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = baseUrl.replace(/\/$/, "");
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function resolvePublicMediaUrl(
  attachments: string[],
  mediaType: MediaType,
  baseUrl: string
): string | null {
  const absoluteUrls = attachments
    .map((url) => toAbsolutePublicUrl(url, baseUrl))
    .filter((url): url is string => Boolean(url));

  if (absoluteUrls.length === 0) {
    return null;
  }

  const matcher = mediaType === "video" ? VIDEO_EXT : IMAGE_EXT;
  const matched = absoluteUrls.find((url) => matcher.test(url.split("?")[0]));
  if (mediaType === "video") {
    if (matched) return matched;
    const link = absoluteUrls.find((url) => isVideoAttachmentUrl(url));
    return link ?? null;
  }

  if (isStillMedia(mediaType)) {
    return matched ?? absoluteUrls[0];
  }

  return matched ?? absoluteUrls[0];
}

export function getAppPublicUrl(): string {
  return (
    process.env.APP_PUBLIC_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
