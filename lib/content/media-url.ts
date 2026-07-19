const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export function isVideoMediaUrl(url: string): boolean {
  return VIDEO_EXT.test(url.split("?")[0]);
}

export function isImageMediaUrl(url: string): boolean {
  return IMAGE_EXT.test(url.split("?")[0]);
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
  mediaType: "video" | "image",
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
  // For video content, never fall back to a non-video attachment — Buffer would post as image.
  if (mediaType === "video") {
    return matched ?? null;
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
