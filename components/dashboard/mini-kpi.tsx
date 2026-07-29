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
    <div className="rounded-lg border border-stone-200/80 bg-white px-3 py-2.5 sm:px-2.5 sm:py-1.5">
      <p className="text-xs font-medium text-stone-500 sm:text-[10px]">{label}</p>
      <p className="mt-1 text-lg font-bold leading-tight text-stone-900 sm:mt-0 sm:text-base">
        {typeof value === "number" ? value.toLocaleString("th-TH") : value}
        {suffix && (
          <span className="ml-0.5 text-xs font-medium text-stone-500 sm:text-[11px]">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
