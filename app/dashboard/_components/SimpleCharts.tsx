function formatAxis(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

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
            <span className="w-full truncate text-center text-[9px] text-slate-400">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SimpleGroupedBarChart({
  data,
  labelKey,
  series,
  height = 220,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  series: { key: string; color: string; label: string }[];
  height?: number;
}) {
  const rawMax = Math.max(
    ...data.flatMap((item) => series.map((s) => Number(item[s.key]) || 0)),
    1
  );
  const max = niceMax(rawMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 gap-2" style={{ height }}>
        <div className="flex w-10 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-slate-400">
          {[...ticks].reverse().map((tick) => (
            <span key={tick}>{formatAxis(tick)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 border-b border-slate-100">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[...ticks].reverse().map((tick, index) => (
              <div
                key={tick}
                className={index === ticks.length - 1 ? "border-t-0" : "border-t border-slate-100"}
              />
            ))}
          </div>
          <div className="relative z-10 flex h-full items-end gap-2 px-1">
            {data.map((item, index) => (
              <div
                key={`${item[labelKey]}-${index}`}
                className="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5"
              >
                {series.map((s) => {
                  const value = Number(item[s.key]) || 0;
                  const barHeight = (value / max) * 100;
                  return (
                    <div
                      key={s.key}
                      className="w-full max-w-3.5 rounded-t-md"
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: s.color,
                        minHeight: value > 0 ? "3px" : "0",
                      }}
                      title={`${s.label}: ${formatAxis(value)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex gap-2">
        <div className="w-10 shrink-0" />
        <div className="flex min-w-0 flex-1 gap-2 px-1">
          {data.map((item, index) => (
            <span
              key={`${item[labelKey]}-${index}`}
              className="min-w-0 flex-1 truncate text-center text-[10px] text-slate-400"
            >
              {item[labelKey]}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimpleStackedBarChart({
  data,
  labelKey,
  series,
  height = 220,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  series: { key: string; color: string; label: string }[];
  height?: number;
}) {
  const rawMax = Math.max(
    ...data.map((item) =>
      series.reduce((sum, s) => sum + (Number(item[s.key]) || 0), 0)
    ),
    1
  );
  const max = niceMax(rawMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 gap-2" style={{ height }}>
        <div className="flex w-8 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-slate-400">
          {[...ticks].reverse().map((tick) => (
            <span key={tick}>{Math.round(tick)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 border-b border-slate-100">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[...ticks].reverse().map((tick, index) => (
              <div
                key={tick}
                className={index === ticks.length - 1 ? "border-t-0" : "border-t border-slate-100"}
              />
            ))}
          </div>
          <div className="relative z-10 flex h-full items-end gap-4 px-2">
            {data.map((item, index) => {
              const total = series.reduce(
                (sum, s) => sum + (Number(item[s.key]) || 0),
                0
              );
              const tooltip = series
                .map((s) => `${s.label}: ${Number(item[s.key]) || 0}`)
                .join("\n");
              return (
                <div
                  key={`${item[labelKey]}-${index}`}
                  className="group flex h-full min-w-0 flex-1 items-end justify-center"
                  title={`${item[labelKey]}\n${tooltip}`}
                >
                  <div
                    className="flex w-full max-w-12 flex-col-reverse overflow-hidden rounded-t-lg transition group-hover:opacity-90"
                    style={{
                      height: `${(total / max) * 100}%`,
                      minHeight: total > 0 ? "10px" : "0",
                    }}
                  >
                    {series.map((s) => {
                      const value = Number(item[s.key]) || 0;
                      if (!value) return null;
                      return (
                        <div
                          key={s.key}
                          style={{
                            height: `${(value / total) * 100}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex gap-2">
        <div className="w-8 shrink-0" />
        <div className="flex min-w-0 flex-1 gap-4 px-2">
          {data.map((item, index) => (
            <span
              key={`${item[labelKey]}-${index}`}
              className="min-w-0 flex-1 truncate text-center text-[11px] font-medium text-slate-600"
            >
              {item[labelKey]}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimpleDonutChart({
  slices,
  size = 168,
  compact = false,
  formatValue,
  legendBelow = false,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  compact?: boolean;
  formatValue?: (value: number) => string;
  legendBelow?: boolean;
}) {
  const chartSize = compact ? 120 : size;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 15.2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const display = formatValue ?? ((value: number) => String(value));

  const legend = (
    <div
      className={
        legendBelow
          ? "grid w-full grid-cols-2 gap-x-4 gap-y-2.5"
          : compact
            ? "w-full space-y-2.5 sm:w-auto sm:min-w-[11rem]"
            : "w-full min-w-[10rem] space-y-2.5"
      }
    >
      {slices.map((slice) => (
        <div
          key={slice.label}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate text-slate-500">{slice.label}</span>
          </div>
          <span className="shrink-0 font-bold text-slate-900">
            {display(slice.value)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={
        legendBelow
          ? "flex flex-col items-center gap-5"
          : compact
            ? "flex flex-col items-center gap-4 py-1 sm:flex-row sm:items-center sm:justify-start sm:gap-5"
            : "flex flex-col items-center gap-5 sm:flex-row sm:items-center"
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
          stroke="#f1f5f9"
          strokeWidth="5"
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
              strokeWidth="5"
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 18 18)"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      {legend}
    </div>
  );
}

export function SimpleAreaChart({
  data,
  lines,
  height = 220,
  fillKey,
}: {
  data: Record<string, string | number>[];
  lines: { key: string; color: string; label: string }[];
  height?: number;
  fillKey?: string;
}) {
  const width = 480;
  const paddingX = 8;
  const paddingTop = 10;
  const paddingBottom = 8;
  const plotHeight = height - paddingTop - paddingBottom;
  const max = niceMax(
    Math.max(
      ...data.flatMap((point) =>
        lines.map((line) => Number(point[line.key]) || 0)
      ),
      1
    )
  );
  const xStep =
    data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);
  const fillLine = fillKey ? lines.find((line) => line.key === fillKey) : lines[0];

  const pointsFor = (key: string) =>
    data.map((point, index) => {
      const value = Number(point[key]) || 0;
      const x = paddingX + index * xStep;
      const y = paddingTop + plotHeight - (value / max) * plotHeight;
      return { x, y };
    });

  const fillPoints = fillLine ? pointsFor(fillLine.key) : [];
  const areaPath =
    fillPoints.length > 0
      ? [
          `M ${fillPoints[0].x} ${paddingTop + plotHeight}`,
          ...fillPoints.map((p) => `L ${p.x} ${p.y}`),
          `L ${fillPoints[fillPoints.length - 1].x} ${paddingTop + plotHeight}`,
          "Z",
        ].join(" ")
      : "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 gap-2" style={{ height }}>
        <div className="flex w-10 shrink-0 flex-col justify-between py-1 text-right text-[10px] text-slate-400">
          {[...ticks].reverse().map((tick) => (
            <span key={tick}>{formatAxis(tick)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-slate-100" />
            ))}
          </div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="relative z-10 h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="reachAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {areaPath ? (
              <path d={areaPath} fill="url(#reachAreaFill)" />
            ) : null}
            {lines.map((line) => {
              const pts = pointsFor(line.key);
              const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
              return (
                <g key={line.key}>
                  <polyline
                    fill="none"
                    stroke={line.color}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={polyline}
                  />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex w-8 shrink-0 flex-col justify-between py-1 text-left text-[10px] text-slate-400">
          {["12%", "9%", "6%", "3%", "0%"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex shrink-0 justify-between gap-2 px-10 text-[10px] text-slate-400">
        {data
          .filter((_, index) => index % Math.max(1, Math.ceil(data.length / 8)) === 0)
          .map((point) => (
            <span key={String(point.label)}>{point.label}</span>
          ))}
      </div>
      <div className="mt-2 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            {line.label}
          </div>
        ))}
      </div>
    </div>
  );
}
