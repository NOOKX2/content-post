import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const PLATFORM_IMAGE_SRC: Partial<Record<Platform, string>> = {
  instagram: "/platforms/instagram.png",
  line: "/platforms/line.png",
};

interface PlatformLogoProps {
  platform: Platform;
  size?: number;
  className?: string;
}

export function PlatformLogo({
  platform,
  size = 20,
  className,
}: PlatformLogoProps) {
  const imageSrc = PLATFORM_IMAGE_SRC[platform];
  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-md object-cover", className)}
        aria-hidden
      />
    );
  }

  const props = {
    width: size,
    height: size,
    className: cn("shrink-0", className),
    "aria-hidden": true as const,
  };

  switch (platform) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="#1877F2" {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="#000000" {...props}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .55.04.81.12V9.01a6.37 6.37 0 0 0-.81-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      );
    case "lemon8":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" rx="6" fill="#FFF100" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill="#1a1a1a"
            fontFamily="system-ui, sans-serif"
          >
            L8
          </text>
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="#FF0000" {...props}>
          <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
      );
    default:
      return null;
  }
}
