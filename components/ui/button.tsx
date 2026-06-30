import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20",
  secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200",
  ghost: "text-stone-600 hover:bg-stone-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline:
    "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
