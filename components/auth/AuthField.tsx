"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export function AuthField({
  label,
  type = "text",
  icon,
  showPasswordToggle,
  error,
  className,
  ...props
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "h-12 w-full rounded-xl bg-slate-100 px-4 text-sm text-slate-900 placeholder:text-slate-400",
            "transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
            (icon || showPasswordToggle) && "pr-11",
            className
          )}
          {...props}
        />
        {(icon || (isPassword && showPasswordToggle)) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {isPassword && showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="text-slate-400">{icon}</span>
            )}
          </div>
        )}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
