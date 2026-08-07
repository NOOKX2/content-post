"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface AuthFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  minLength,
  icon,
  showPasswordToggle,
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          className={cn(
            "h-12 w-full rounded-xl bg-slate-100 px-4 text-sm text-slate-900 placeholder:text-slate-400",
            "transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
            (icon || showPasswordToggle) && "pr-11"
          )}
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
    </div>
  );
}
