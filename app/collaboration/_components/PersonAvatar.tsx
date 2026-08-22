"use client";

import { cn } from "@/lib/shared/utils";

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-blue-600 text-white",
  "bg-stone-200 text-stone-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-800",
] as const;

const VIVID_COLORS = [
  "bg-blue-500 text-white",
  "bg-sky-500 text-white",
  "bg-cyan-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-emerald-500 text-white",
  "bg-indigo-500 text-white",
  "bg-pink-500 text-white",
] as const;

function colorForName(name: string, palette: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % palette.length;
  }
  return palette[hash];
}

export function initialsForName(name: string, letters: 1 | 2 = 1) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (letters === 2) {
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
    }
    return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export function PersonAvatar({
  name,
  size = "md",
  className,
  title,
  imageUrl,
  tone = "default",
  letters = 1,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  title?: string;
  imageUrl?: string | null;
  tone?: "default" | "vivid";
  letters?: 1 | 2;
}) {
  const initial = initialsForName(name, letters);
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 text-[10px]"
      : size === "lg"
        ? "h-10 w-10 text-sm"
        : size === "xl"
          ? "h-12 w-12 text-base"
          : "h-8 w-8 text-[11px]";
  const ringClass = tone === "vivid" ? "ring-0" : "ring-2 ring-white";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={title ?? name}
        title={title ?? name}
        className={cn(
          "inline-flex shrink-0 rounded-full object-cover",
          ringClass,
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <span
      title={title ?? name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        ringClass,
        sizeClass,
        colorForName(name, tone === "vivid" ? VIVID_COLORS : AVATAR_COLORS),
        className
      )}
    >
      {initial}
    </span>
  );
}

export function AvatarStack({
  names,
  max = 4,
  size = "sm",
}: {
  names: string[];
  max?: number;
  size?: "sm" | "md";
}) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((name, index) => (
        <PersonAvatar
          key={`${name}-${index}`}
          name={name}
          size={size}
          className={cn(index > 0 && "-ml-2")}
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600 ring-2 ring-white",
            size === "sm" ? "h-7 w-7 -ml-2 text-[10px]" : "h-8 w-8 -ml-2 text-[11px]"
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
