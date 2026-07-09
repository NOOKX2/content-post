export function MiniKpi({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200/80 bg-white px-2.5 py-1.5">
      <p className="truncate text-[10px] font-medium text-stone-500">{label}</p>
      <p className="text-base font-bold leading-tight text-stone-900">
        {typeof value === "number" ? value.toLocaleString("th-TH") : value}
        {suffix && (
          <span className="ml-0.5 text-[11px] font-medium text-stone-500">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
