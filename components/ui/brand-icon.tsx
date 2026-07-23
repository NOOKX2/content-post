import { cn } from "@/lib/utils";

type BrandIconProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

export function BrandIcon({ className, size = "md" }: BrandIconProps) {
  return (
    <img
      src="/logo.svg"
      alt=""
      aria-hidden
      className={cn("shrink-0", sizeClasses[size], className)}
    />
  );
}
