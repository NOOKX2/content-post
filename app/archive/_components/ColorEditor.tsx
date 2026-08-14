"use client";

import { useCallback, useRef } from "react";
import { Hash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const WHEEL_SIZE = 152;
const HANDLE_INSET = 10;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const n = Number.parseInt(match[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function rgbToHsl(r: number, g: number, b: number) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
  else if (max === ng) h = (nb - nr) / d + 2;
  else h = (nr - ng) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

function rgbToHsv(r: number, g: number, b: number) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
    else if (max === ng) h = (nb - nr) / d + 2;
    else h = (nr - ng) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number) {
  const ns = s / 100;
  const nv = v / 100;
  const c = nv * ns;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = nv - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function ColorWheel({
  hue,
  saturation,
  color,
  label,
  onChange,
}: {
  hue: number;
  saturation: number;
  color: string;
  label: string;
  onChange: (hue: number, saturation: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const pick = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      const maxR = rect.width / 2 - HANDLE_INSET;
      const dist = Math.sqrt(dx * dx + dy * dy);
      onChange(deg, clamp((dist / maxR) * 100, 0, 100));
    },
    [onChange]
  );

  const radius = WHEEL_SIZE / 2 - HANDLE_INSET;
  const rad = (hue * Math.PI) / 180;
  const sat = clamp(saturation, 0, 100) / 100;
  const handleX = Math.cos(rad) * sat * radius;
  const handleY = Math.sin(rad) * sat * radius;

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hue)}
      tabIndex={0}
      className="relative shrink-0 cursor-crosshair touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      style={{
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        background: [
          "radial-gradient(circle at center, #ffffff 0%, rgba(255,255,255,0) 72%)",
          "conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
        ].join(","),
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        pick(event.clientX, event.clientY);
      }}
    >
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 h-[18px] w-[18px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.2)]"
        style={{
          backgroundColor: color,
          transform: `translate(calc(-50% + ${handleX}px), calc(-50% + ${handleY}px))`,
        }}
      />
    </div>
  );
}

export function ColorEditor({
  title,
  name,
  hex,
  saving,
  error,
  namePlaceholder,
  nameLabel,
  hexLabel,
  pickLabel,
  saveLabel,
  cancelLabel,
  deleteLabel,
  savingLabel,
  onNameChange,
  onHexChange,
  onSave,
  onCancel,
  onDelete,
}: {
  title: string;
  name: string;
  hex: string;
  saving: boolean;
  error: string;
  namePlaceholder: string;
  nameLabel: string;
  hexLabel: string;
  pickLabel: string;
  saveLabel: string;
  cancelLabel: string;
  deleteLabel: string;
  savingLabel: string;
  onNameChange: (value: string) => void;
  onHexChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const parsed = hexToRgb(hex);
  const lastValid = useRef(parsed ?? { r: 142, g: 68, b: 173 });
  if (parsed) lastValid.current = parsed;
  const rgb = parsed ?? lastValid.current;
  const preview = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>

      <div className="mt-5 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center">
        <ColorWheel
          hue={hsv.h}
          saturation={hsv.s}
          color={preview}
          label={pickLabel}
          onChange={(hue, saturation) => {
            const value = hsv.v < 8 ? 100 : hsv.v;
            const next = hsvToRgb(hue, saturation, value);
            onHexChange(rgbToHex(next.r, next.g, next.b));
          }}
        />
        <div
          className="min-h-[120px] flex-1 rounded-2xl border border-black/5 sm:min-h-[152px]"
          style={{ backgroundColor: preview }}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-700">{nameLabel}</span>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={namePlaceholder}
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-700">{hexLabel}</span>
          <span className="relative">
            <input
              value={hex}
              onChange={(event) => {
                const next = event.target.value.trim();
                onHexChange(next.startsWith("#") || next === "" ? next : `#${next}`);
              }}
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 pr-9 font-mono text-sm uppercase tracking-wide text-stone-900 placeholder:text-stone-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Hash className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          </span>
          <p className="text-xs leading-5 text-stone-400">
            RGB: {rgb.r}, {rgb.g}, {rgb.b}
            <br />
            HSL: {Math.round(hsl.h)}°, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%
          </p>
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        {onDelete && (
          <Button
            type="button"
            variant="danger"
            className="mr-auto"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            {deleteLabel}
          </Button>
        )}
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? savingLabel : saveLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
