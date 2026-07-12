"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLink } from "@/components/layout/dashboard-link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { TEAM_MEMBERS } from "@/lib/constants";
import {
  CALENDAR_EVENT_STYLES,
  formatDateKey,
} from "@/lib/calendar/content";
import {
  getContentCalendarDate,
  getPostStatusDotClass,
  type CalendarDateField,
} from "@/lib/calendar/filters";
import { cn, formatLocations } from "@/lib/utils";

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
  const [name, setName] = useState(content?.name ?? "");
  const [scheduledDate, setScheduledDate] = useState(
    content?.scheduledDate ?? defaultDate ?? ""
  );
  const [scheduledTime, setScheduledTime] = useState(
    content?.scheduledTime ?? "10:00"
  );
  const [endTime, setEndTime] = useState(content?.endTime ?? "11:00");
  const [channel, setChannel] = useState(content?.channel ?? "");
  const [details, setDetails] = useState(content?.details ?? "");
  const [ideaCreator, setIdeaCreator] = useState(content?.ideaCreator ?? "");
  const { data: postingData } = useSWR("/api/posting-channels", (url: string) =>
    fetch(url).then((res) => res.json())
  );
  const channelOptions =
    postingData?.channels?.map((item: { slug: string; label: string }) => ({
      value: item.slug,
      label: item.label,
    })) ?? [];

  if (!open) return null;

  const handleSave = () => {
    onSave?.({
      name,
      scheduledDate,
      scheduledTime,
      endTime,
      channel,
      details,
      ideaCreator,
    });
    onClose();
  };

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

        <div className="space-y-4 p-6">
          <Input
            label="ชื่อ Event"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Design"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="วันที่"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <Input
              label="เวลา post"
              type="time"
              value={scheduledTime}
              onChange={(e) => {
                setScheduledTime(e.target.value);
                setEndTime("");
              }}
            />
          </div>
          <Select
            label="ช่อง"
            options={channelOptions}
            placeholder="เลือก..."
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
          <Select
            label="ผู้รับผิดชอบ"
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={ideaCreator}
            onChange={(e) => setIdeaCreator(e.target.value)}
          />
          <Textarea
            label="รายละเอียด"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
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
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>บันทึก</Button>
        </div>
      </div>
    </div>
  );
}

interface CalendarViewProps {
  contents: ContentItem[];
  dateField?: CalendarDateField;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const DAYS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

export function CalendarView({
  contents,
  dateField = "post",
}: CalendarViewProps) {
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
      <div className="flex h-full flex-col rounded-xl border border-stone-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-semibold text-stone-900 capitalize">
              {monthLabel}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedContent(null);
              setModalOpen(true);
            }}
          >
            + Event
          </Button>
        </div>

        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-stone-200">
          <div />
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={cn(
                  "border-l border-stone-100 px-2 py-2 text-center",
                  isToday && "bg-blue-50"
                )}
              >
                <div className="text-xs text-stone-500">{DAYS[i]}</div>
                <div
                  className={cn(
                    "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
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
          <div className="grid grid-cols-[60px_repeat(7,1fr)]">
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-b border-stone-100 px-2 py-3 text-right text-xs text-stone-400">
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
                      className="relative min-h-[60px] border-b border-l border-stone-100 p-1"
                    >
                      {events.map((event) => (
                        <DashboardLink
                          key={event.id}
                          href={`/content/${event.id}`}
                          className={cn(
                            "mb-1 block w-full rounded-md px-2 py-1 text-left text-xs font-medium transition-colors line-clamp-2 hover:opacity-90",
                            CALENDAR_EVENT_STYLES[event.status]
                          )}
                        >
                          {event.name}
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
