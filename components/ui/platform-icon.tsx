import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: Platform;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function PlatformIcon({
  platform,
  size = "sm",
  showLabel = false,
}: PlatformIconProps) {
  const config = PLATFORMS.find((p) => p.id === platform);
  if (!config) return null;

  const sizeClass = size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white shrink-0",
        sizeClass
      )}
      style={{ backgroundColor: config.color }}
      title={config.label}
    >
      {showLabel ? config.shortLabel : config.shortLabel.charAt(0)}
    </span>
  );
}

interface PlatformBadgeGroupProps {
  platforms: Platform[];
  size?: "sm" | "md";
}

export function PlatformBadgeGroup({
  platforms,
  size = "sm",
}: PlatformBadgeGroupProps) {
  return (
    <div className="flex items-center gap-1">
      {platforms.map((p) => (
        <PlatformIcon key={p} platform={p} size={size} />
      ))}
    </div>
  );
}
