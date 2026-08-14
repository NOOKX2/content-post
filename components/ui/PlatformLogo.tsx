import type { Platform } from "@/lib/types";
import { cn } from "@/lib/shared/utils";

const PLATFORM_IMAGE_SRC: Partial<Record<Platform, string>> = {
  instagram: "/platforms/instagram.png",
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
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="#FF0000" {...props}>
          <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 24 24" fill="#06C755" {...props}>
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .345-.279.629-.631.629-.346 0-.626-.284-.626-.629V8.108c0-.27.173-.51.43-.595.063-.022.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .345-.282.629-.631.629-.345 0-.627-.284-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.316C24 4.943 18.615.749 12 .749S0 4.943 0 10.316c0 4.81 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.316" />
        </svg>
      );
    case "lemon8":
      return (
        <svg viewBox="0 0 24 24" fill="#FFC700" {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" fill="#111111" />
          <path
            fill="#FFC700"
            d="M7.2 16.8V7.2h2.3l3.2 5.4V7.2h2.1v9.6h-2.3l-3.2-5.4v5.4H7.2z"
          />
        </svg>
      );
    default:
      return null;
  }
}
