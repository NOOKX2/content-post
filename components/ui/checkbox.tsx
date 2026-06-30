import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const checkboxId = id || label.replace(/\s/g, "-").toLowerCase();
  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        className
      )}
    >
      <input
        type="checkbox"
        id={checkboxId}
        className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500/20"
        {...props}
      />
      <span className="text-sm text-stone-700">{label}</span>
    </label>
  );
}
