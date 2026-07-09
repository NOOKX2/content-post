"use client";

import { LOCATIONS } from "@/lib/constants";
import { CreatableMultiSelect } from "@/components/ui/creatable-multi-select";

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
  return (
    <CreatableMultiSelect
      label="สถานที่ถ่าย"
      options={LOCATIONS}
      value={selected}
      onChange={onChange}
      optional={optional}
      placeholder="เลือกสถานที่..."
      addPlaceholder="พิมพ์สถานที่เพิ่มเอง..."
    />
  );
}
