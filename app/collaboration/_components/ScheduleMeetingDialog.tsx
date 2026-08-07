"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Link2, Type, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type MeetingDraft = {
  title: string;
  meetUrl: string;
  startsAt: string;
  endsAt: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toLocalInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FieldShell({
  icon: Icon,
  children,
}: {
  icon: typeof Type;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-stone-100 px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={2} />
      {children}
    </div>
  );
}

export function ScheduleMeetingDialog({
  open,
  prefillStart,
  prefillEnd,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  prefillStart: Date;
  prefillEnd: Date;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (draft: MeetingDraft) => void;
}) {
  const [title, setTitle] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setMeetUrl("");
      setStartsAt(toLocalInputValue(prefillStart));
      setEndsAt(toLocalInputValue(prefillEnd));
    }
  }, [open, prefillStart, prefillEnd]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      meetUrl: meetUrl.trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-meeting-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Video className="h-4 w-4" />
            </span>
            <div>
              <h2
                id="schedule-meeting-title"
                className="text-base font-semibold text-stone-900"
              >
                นัดประชุมใหม่
              </h2>
              <p className="text-[11px] text-stone-500">
                สร้างลิงก์ Meet และส่งคำเชิญเข้าปฏิทินอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-5">
          <FieldShell icon={Type}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="หัวข้อการประชุม"
              className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
              required
              autoFocus
            />
          </FieldShell>

          <FieldShell icon={Link2}>
            <input
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="ลิงก์ Meet (เว้นว่างเพื่อสร้างอัตโนมัติ)"
              className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
            />
          </FieldShell>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">
                เวลาเริ่ม
              </label>
              <FieldShell icon={Calendar}>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none"
                  required
                />
              </FieldShell>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">
                เวลาสิ้นสุด
              </label>
              <FieldShell icon={Calendar}>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none"
                  required
                />
              </FieldShell>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !startsAt || !endsAt}
            >
              นัดประชุม
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
