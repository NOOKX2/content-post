"use client";

import { LOCATIONS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

interface LocationSelectProps {
  selected: string[];
  onChange: (locations: string[]) => void;
  optional?: boolean;
}

export function LocationSelect({
  selected,
  onChange,
  optional = false,
}: LocationSelectProps) {
  const toggle = (location: string) => {
    if (selected.includes(location)) {
      onChange(selected.filter((l) => l !== location));
    } else {
      onChange([...selected, location]);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <span className="text-sm font-medium text-stone-700">
        สถานที่ถ่าย
        {optional && (
          <span className="ml-1 font-normal text-stone-400">(ไม่บังคับ)</span>
        )}
      </span>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {LOCATIONS.map((location) => (
          <Checkbox
            key={location}
            label={location}
            checked={selected.includes(location)}
            onChange={() => toggle(location)}
          />
        ))}
      </div>
    </div>
  );
}
