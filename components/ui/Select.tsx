import { flatFieldClass, flatLabelClass } from "@/lib/shared/form-field-styles";
import { cn } from "@/lib/shared/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: readonly string[] | { value: string; label: string }[];
  placeholder?: string;
  variant?: "default" | "flat";
}

export function Select({
  className,
  label,
  options,
  placeholder,
  id,
  variant = "default",
  ...props
}: SelectProps) {
  const selectId = id || label?.replace(/\s/g, "-").toLowerCase();
  const isFlat = variant === "flat";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            isFlat ? flatLabelClass : "text-sm font-medium text-stone-700"
          )}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          isFlat
            ? flatFieldClass
            : "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}
