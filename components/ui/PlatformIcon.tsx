import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { PlatformLogo } from "@/components/ui/PlatformLogo";

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

  const logoSize = size === "sm" ? 20 : 24;

  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      title={config.label}
    >
      <PlatformLogo platform={platform} size={logoSize} />
      {showLabel && (
        <span className="text-xs text-stone-600">{config.label}</span>
      )}
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
    <div className="flex items-center gap-1.5">
      {platforms.map((p) => (
        <PlatformIcon key={p} platform={p} size={size} />
      ))}
    </div>
  );
}
