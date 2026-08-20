import { flatLabelClass, flatTextareaClass } from "@/lib/shared/form-field-styles";
import { cn } from "@/lib/shared/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  variant?: "default" | "flat";
}

export function Textarea({
  className,
  label,
  id,
  variant = "default",
  ...props
}: TextareaProps) {
  const textareaId = id || label?.replace(/\s/g, "-").toLowerCase();
  const isFlat = variant === "flat";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            isFlat ? flatLabelClass : "text-sm font-medium text-stone-700"
          )}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          isFlat
            ? flatTextareaClass
            : "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y min-h-[80px]",
          className
        )}
        {...props}
      />
    </div>
  );
}
