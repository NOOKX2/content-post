"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Link2, Type, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { meetingDraftSchema } from "@/lib/content/domain/form-schema";
import { cn } from "@/lib/shared/utils";

function FieldShell({
  icon: Icon,
  children,
  className,
}: {
  icon: typeof Type;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl bg-stone-100 px-3 py-2.5",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={2} />
      {children}
    </div>
  );
}

export function GoogleMeetSchedulePanel({
  meetingTitle,
  setMeetingTitle,
  meetUrl,
  setMeetUrl,
  startsAt,
  setStartsAt,
  endsAt,
  setEndsAt,
  submitting,
  onSubmit,
  onClose,
}: {
  meetingTitle: string;
  setMeetingTitle: (v: string) => void;
  meetUrl: string;
  setMeetUrl: (v: string) => void;
  startsAt: string;
  setStartsAt: (v: string) => void;
  endsAt: string;
  setEndsAt: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(meetingDraftSchema),
    values: {
      title: meetingTitle,
      meetUrl,
      startsAt,
      endsAt,
    },
  });
  const titleValue = watch("title");

  return (
    <form
      onSubmit={handleSubmit(() => onSubmit({ preventDefault() {} } as React.FormEvent))}
      className="mb-3 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Video className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-900">Google Meet</p>
            <p className="text-[11px] text-stone-500">สร้างการประชุมวิดีโอใหม่</p>
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

      <div className="space-y-2.5 p-3">
        <FieldShell icon={Type}>
          <input
            {...register("title", {
              onChange: (e) => setMeetingTitle(e.target.value),
            })}
            placeholder="Meeting Title"
            className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
            autoFocus
          />
        </FieldShell>

        <FieldShell icon={Link2}>
          <input
            {...register("meetUrl", {
              onChange: (e) => setMeetUrl(e.target.value),
            })}
            placeholder="ลิงก์ Meet (เว้นว่างเพื่อสร้างอัตโนมัติ)"
            className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
          />
        </FieldShell>
        <p className="px-1 text-[11px] text-stone-400">
          ระบบจะสร้างลิงก์ Google Meet และส่งคำเชิญเข้าปฏิทินของสมาชิกทุกคนอัตโนมัติ
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-600">
              Start Time
            </label>
            <FieldShell icon={Calendar}>
              <input
                type="datetime-local"
                {...register("startsAt", {
                  onChange: (e) => setStartsAt(e.target.value),
                })}
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none"
              />
            </FieldShell>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-600">
              End Time
            </label>
            <FieldShell icon={Calendar}>
              <input
                type="datetime-local"
                {...register("endsAt", {
                  onChange: (e) => setEndsAt(e.target.value),
                })}
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none"
              />
            </FieldShell>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 border-t border-stone-100 px-3 py-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="bg-slate-900 px-4 hover:bg-slate-800"
          disabled={submitting || !titleValue.trim() || !startsAt || !endsAt}
        >
          Schedule Meeting
        </Button>
      </div>
    </form>
  );
}
