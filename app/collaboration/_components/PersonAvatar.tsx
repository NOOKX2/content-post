"use client";

import { cn } from "@/lib/shared/utils";

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-blue-600 text-white",
  "bg-stone-200 text-stone-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-800",
] as const;

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

export function PersonAvatar({
  name,
  size = "md",
  className,
  title,
  imageUrl,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  title?: string;
  imageUrl?: string | null;
}) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 text-[10px]"
      : size === "lg"
        ? "h-10 w-10 text-sm"
        : size === "xl"
          ? "h-12 w-12 text-base"
          : "h-8 w-8 text-[11px]";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={title ?? name}
        title={title ?? name}
        className={cn(
          "inline-flex shrink-0 rounded-full object-cover ring-2 ring-white",
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
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-white",
        sizeClass,
        colorForName(name),
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
