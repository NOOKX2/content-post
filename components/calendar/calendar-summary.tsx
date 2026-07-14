import { Card } from "@/components/ui/card";

interface CalendarSummaryProps {
  total: number;
  waiting: number;
  posted: number;
  needsEdit: number;
}

export function CalendarSummary({
  total,
  waiting,
  posted,
  needsEdit,
}: CalendarSummaryProps) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-stone-800">
        Summary — สรุปจำนวนงานทั้งหมด
      </h3>
      <p className="mt-1 text-xs text-stone-500">
        ตารางสำหรับดูโพสที่ลง — ขั้นตอนการลงโพสอย่างเดียว
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="งานทั้งหมด" value={total} />
        <SummaryStat
          label="คอนเทนต์ที่รอโพส"
          value={waiting}
          dotClass="bg-orange-500"
        />
        <SummaryStat
          label="คอนเทนต์ที่โพสแล้ว"
          value={posted}
          dotClass="bg-emerald-500"
        />
        <SummaryStat
          label="คอนเทนต์รอแก้ไข"
          value={needsEdit}
          dotClass="bg-red-500"
        />
      </div>
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
      <div className="flex items-center gap-2">
        {dotClass && (
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
        )}
        <p className="text-xs text-stone-500">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
