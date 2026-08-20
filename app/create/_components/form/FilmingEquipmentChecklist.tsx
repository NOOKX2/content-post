"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  FILMING_EQUIPMENT_GROUPS,
  type FilmingEquipmentGroup,
} from "@/lib/constants";
import { flatFieldClass } from "@/lib/shared/form-field-styles";
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
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-teal-600 focus:ring-teal-500/30"
      />
      <span className="text-sm leading-6">{label}</span>
    </label>
  );
}

export function getFilmingEquipmentTotalCount(): number {
  return FILMING_EQUIPMENT_GROUPS.reduce(
    (total, group) => total + groupSelectableItems(group).length,
    0
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
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
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
              <ul className="space-y-1">
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

      <div className="flex w-full gap-2 border-t border-stone-100 pt-4">
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
          className={flatFieldClass}
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
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-700"
            >
              {item}
              <button
                type="button"
                onClick={() => toggleItem(item)}
                className="rounded-full p-0.5 text-stone-400 hover:text-stone-700"
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
