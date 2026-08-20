"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLink } from "@/components/layout/DashboardLink";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { TEAM_MEMBERS } from "@/lib/constants";
import { ContentSummaryCard } from "@/components/content/ContentSummaryCard";
import { formatDateKey } from "@/lib/calendar/data/content";
import {
  getContentCalendarDate,
  getMediaTypeCardClass,
  type CalendarDateField,
} from "@/lib/calendar/domain/filters";
import { cn, formatLocations } from "@/lib/shared/utils";
import { calendarEventSchema } from "@/lib/content/domain/form-schema";
import { dateLocale, useT } from "@/lib/i18n";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  content?: ContentItem | null;
  defaultDate?: string;
  onSave?: (data: {
    name: string;
    scheduledDate: string;
    scheduledTime: string;
    endTime: string;
    channel: string;
    details: string;
    ideaCreator: string;
  }) => void;
}

export function EventModal({
  open,
  onClose,
  content,
  defaultDate,
  onSave,
}: EventModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      name: content?.name ?? "",
      scheduledDate: content?.scheduledDate ?? defaultDate ?? "",
      scheduledTime: content?.scheduledTime ?? "10:00",
      endTime: content?.endTime ?? "11:00",
      channel: content?.channel ?? "",
      details: content?.details ?? "",
      ideaCreator: content?.ideaCreator ?? "",
    },
  });
  const { data: postingData } = useSWR("/api/posting-channels", (url: string) =>
    fetch(url).then((res) => res.json())
  );
  const channelOptions =
    postingData?.channels?.map((item: { slug: string; label: string }) => ({
      value: item.slug,
      label: item.label,
    })) ?? [];

  useEffect(() => {
    if (!open) return;
    reset({
      name: content?.name ?? "",
      scheduledDate: content?.scheduledDate ?? defaultDate ?? "",
      scheduledTime: content?.scheduledTime ?? "10:00",
      endTime: content?.endTime ?? "11:00",
      channel: content?.channel ?? "",
      details: content?.details ?? "",
      ideaCreator: content?.ideaCreator ?? "",
    });
  }, [open, content, defaultDate, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit((values) => {
    onSave?.(values);
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-900">
            {content ? "แก้ไข Event" : "สร้าง Event ใหม่"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
        <div className="space-y-4 p-6">
          <Input
            label="ชื่อ Event"
            placeholder="Product Design"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="วันที่"
              type="date"
              {...register("scheduledDate")}
            />
            <Input
              label="เวลา post"
              type="time"
              {...register("scheduledTime")}
            />
          </div>
          <Select
            label="ช่อง"
            options={channelOptions}
            placeholder="เลือก..."
            {...register("channel")}
          />
          <Select
            label="ผู้รับผิดชอบ"
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            {...register("ideaCreator")}
          />
          <Textarea
            label="รายละเอียด"
            rows={3}
            {...register("details")}
          />

          {content && (
            <div className="flex gap-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {content.scheduledTime}
              </span>
              {content.location.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {formatLocations(content.location)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-200 px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit">บันทึก</Button>
        </div>
        </form>
      </div>
    </div>
  );
}

interface CalendarViewProps {
  contents: ContentItem[];
  dateField?: CalendarDateField;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
export function CalendarView({
  contents,
  dateField = "post",
}: CalendarViewProps) {
  const { locale } = useT();
  const loc = dateLocale(locale);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const getEventsForDay = (date: Date) => {
    const dateStr = formatDateKey(date);
    return contents.filter(
      (content) => getContentCalendarDate(content, dateField) === dateStr
    );
  };

  const navigate = (dir: -1 | 1) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + dir * 7);
    setCurrentDate(next);
  };

  const monthLabel = currentDate.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-stone-200 px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-xs font-semibold text-stone-900 capitalize sm:text-sm">
              {monthLabel}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => {
              setSelectedContent(null);
              setModalOpen(true);
            }}
          >
            + Event
          </Button>
        </div>

        <div className="grid grid-cols-[28px_repeat(7,minmax(0,1fr))] border-b border-stone-200 sm:grid-cols-[60px_repeat(7,minmax(0,1fr))]">
          <div />
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={cn(
                  "border-l border-stone-100 px-0.5 py-1.5 text-center sm:px-2 sm:py-2",
                  isToday && "bg-blue-50"
                )}
              >
                <div className="text-xs font-bold text-stone-800 sm:text-sm">
                  {day.toLocaleDateString(loc, {
                    weekday: locale === "en" ? "short" : "long",
                  })}
                </div>
                <div
                  className={cn(
                    "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm",
                    isToday
                      ? "bg-blue-600 text-white"
                      : "text-stone-800"
                  )}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[28px_repeat(7,minmax(0,1fr))] sm:grid-cols-[60px_repeat(7,minmax(0,1fr))]">
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-b border-stone-100 px-1 py-2 text-right text-[10px] text-stone-400 sm:px-2 sm:py-3 sm:text-xs">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIdx) => {
                  const events = getEventsForDay(day).filter((e) => {
                    const eventHour = parseInt(
                      e.scheduledTime?.split(":")[0] ?? "0",
                      10
                    );
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={dayIdx}
                      className="relative min-h-[44px] border-b border-l border-stone-100 p-0.5 sm:min-h-[60px] sm:p-1"
                    >
                      {events.map((event) => (
                        <DashboardLink
                          key={event.id}
                          href={`/content/${event.id}`}
                          className={cn(
                            "mb-0.5 block w-full rounded px-1 py-0.5 text-left transition-shadow hover:shadow-sm sm:mb-1 sm:rounded-md sm:px-1.5 sm:py-1",
                            getMediaTypeCardClass(event.mediaType)
                          )}
                        >
                          <ContentSummaryCard content={event} compact />
                        </DashboardLink>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={selectedContent}
        defaultDate={currentDate.toISOString().split("T")[0]}
      />
    </>
  );
}
