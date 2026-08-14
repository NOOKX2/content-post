"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  FILMING_EQUIPMENT_GROUPS,
  type FilmingEquipmentGroup,
} from "@/lib/constants";
import { cn } from "@/lib/shared/utils";

function groupSelectableItems(group: FilmingEquipmentGroup): string[] {
  return group.items.length > 0 ? [...group.items] : [group.kit];
}

function CheckboxRow({
  id,
  label,
  checked,
  onChange,
  heading = false,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  heading?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 py-0.5",
        heading ? "font-semibold text-stone-900" : "text-stone-800"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-blue-600 focus:ring-blue-500/30"
      />
      <span className="text-sm leading-6">{label}</span>
    </label>
  );
}

export function FilmingEquipmentChecklist({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const [customText, setCustomText] = useState("");

  const toggleItem = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((current) => current !== item));
      return;
    }
    onChange([...value, item]);
  };

  const addCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setCustomText("");
  };

  const knownItems = new Set(
    FILMING_EQUIPMENT_GROUPS.flatMap((group) => groupSelectableItems(group))
  );
  const customSelected = value.filter((item) => !knownItems.has(item));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-sm font-medium text-stone-700">อุปกรณ์ถ่าย</span>

      <div className="space-y-4 rounded-xl border border-stone-200 bg-white px-4 py-4">
        {FILMING_EQUIPMENT_GROUPS.map((group) => {
          const isKitOnly = group.items.length === 0;

          if (isKitOnly) {
            return (
              <CheckboxRow
                key={group.label}
                id={`filming-${group.label}`}
                label={group.label}
                checked={value.includes(group.kit)}
                onChange={() => toggleItem(group.kit)}
                heading
              />
            );
          }

          return (
            <div key={group.label} className="space-y-1.5">
              <p className="text-sm font-semibold text-stone-900">
                {group.label}
              </p>
              <ul className="space-y-1 pl-1">
                {group.items.map((item) => (
                  <li key={item}>
                    <CheckboxRow
                      id={`filming-${group.label}-${item}`}
                      label={item}
                      checked={value.includes(item)}
                      onChange={() => toggleItem(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex w-full gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="อื่นๆ..."
          className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCustom}
          disabled={!customText.trim()}
          className="h-10 shrink-0 px-3"
        >
          <Plus className="h-4 w-4" />
          เพิ่ม
        </Button>
      </div>

      {customSelected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customSelected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
            >
              {item}
              <button
                type="button"
                onClick={() => toggleItem(item)}
                className="rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                aria-label={`ลบ ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
