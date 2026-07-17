"use client";

import { useEffect, useState } from "react";
import type { MeetingCardMetadata } from "@/lib/collaboration/types";
import { Video } from "lucide-react";
import { formatThaiDate } from "@/lib/utils";

function formatCountdown(ms: number) {
  if (ms <= 0) return "จบแล้ว";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `เหลือ ${hours} ชม. ${minutes} นาที`;
  }
  return `เหลือ ${minutes} นาที ${seconds} วินาที`;
}

export function MeetingCardMessage({
  metadata,
}: {
  metadata: MeetingCardMetadata;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startsAt = new Date(metadata.startsAt).getTime();
  const endsAt = new Date(metadata.endsAt).getTime();
  const countdown =
    now < startsAt
      ? formatCountdown(startsAt - now)
      : now < endsAt
        ? `กำลังประชุม — ${formatCountdown(endsAt - now)}`
        : "จบแล้ว";

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-3 py-2">
        <Video className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">นัดประชุม</span>
      </div>
      <div className="space-y-2 px-3 py-3 text-sm">
        <p className="font-semibold text-stone-900">{metadata.title}</p>
        <p className="text-xs text-stone-500">
          {formatThaiDate(metadata.startsAt.slice(0, 10))}{" "}
          {metadata.startsAt.slice(11, 16)} – {metadata.endsAt.slice(11, 16)}
        </p>
        <p className="text-xs font-medium text-blue-700">{countdown}</p>
        <a
          href={metadata.meetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Video className="h-3.5 w-3.5" />
          เข้า Google Meet
        </a>
      </div>
    </div>
  );
}
