export function SimpleBarChart({
  data,
  valueKey,
  labelKey,
  color = "#3b82f6",
  height = 180,
  compact = false,
}: {
  data: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  color?: string;
  height?: number;
  compact?: boolean;
}) {
  const chartHeight = compact ? 72 : height;
  const max = Math.max(
    ...data.map((item) => Number(item[valueKey]) || 0),
    1
  );

  return (
    <div
      className="flex h-full items-end gap-1.5"
      style={{ minHeight: chartHeight }}
    >
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const barHeight = (value / max) * 100;
        return (
          <div
            key={`${item[labelKey]}-${index}`}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: color,
                  minHeight: value > 0 ? "4px" : "0",
                }}
                title={`${value.toLocaleString("th-TH")}`}
              />
            </div>
            <span className="w-full truncate text-center text-[9px] text-stone-500">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SimpleDonutChart({
  slices,
  size = 160,
  compact = false,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  compact?: boolean;
}) {
  const chartSize = compact ? 96 : size;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div
      className={
        compact
          ? "flex h-full items-center gap-2"
          : "flex flex-col items-center gap-4 sm:flex-row sm:items-start"
      }
    >
      <svg
        width={chartSize}
        height={chartSize}
        viewBox="0 0 36 36"
        className="shrink-0"
      >
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#f5f5f4"
          strokeWidth="4"
        />
        {slices.map((slice) => {
          const dash = (slice.value / total) * circumference;
          const circle = (
            <circle
              key={slice.label}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="4"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 18 18)"
            />
          );
          offset += dash;
          return circle;
        })}
        <text
          x="18"
          y="18.5"
          textAnchor="middle"
          className="fill-stone-900 text-[5px] font-bold"
        >
          {total}
        </text>
      </svg>
      <div className={compact ? "min-w-0 space-y-1" : "space-y-2"}>
        {slices.map((slice) => (
          <div
            key={slice.label}
            className={
              compact
                ? "flex items-center gap-1.5 text-[11px]"
                : "flex items-center gap-2 text-sm"
            }
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate text-stone-600">{slice.label}</span>
            <span className="font-semibold text-stone-900">{slice.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimpleAreaChart({
  data,
  lines,
  height = 180,
  compact = false,
}: {
  data: Record<string, string | number>[];
  lines: { key: string; color: string; label: string }[];
  height?: number;
  compact?: boolean;
}) {
  const chartHeight = compact ? 100 : height;
  const width = 320;
  const padding = 8;
  const plotHeight = chartHeight - padding * 2;
  const max = Math.max(
    ...data.flatMap((point) =>
      lines.map((line) => Number(point[line.key]) || 0)
    ),
    1
  );

  const xStep =
    data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <svg
        viewBox={`0 0 ${width} ${chartHeight}`}
        className="min-h-0 w-full flex-1"
        preserveAspectRatio="none"
      >
        {lines.map((line) => {
          const points = data
            .map((point, index) => {
              const value = Number(point[line.key]) || 0;
              const x = padding + index * xStep;
              const y = padding + plotHeight - (value / max) * plotHeight;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={line.key}>
              <polyline
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                points={points}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-2">
        {lines.map((line) => (
          <div
            key={line.key}
            className="flex items-center gap-1 text-[10px] sm:text-xs"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <span className="text-stone-600">{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
