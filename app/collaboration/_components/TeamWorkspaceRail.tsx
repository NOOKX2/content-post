"use client";

import { CalendarDays, CheckSquare, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

export type TeamWorkspaceSection = "chat" | "calendar" | "members" | "tasks";

function RailButton({
  active,
  label,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: typeof MessageCircle;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl transition",
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
          : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
      )}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

export function TeamWorkspaceRail({
  section,
  onChange,
}: {
  section: TeamWorkspaceSection;
  onChange: (section: TeamWorkspaceSection) => void;
}) {
  const { t } = useT();
  const primary = [
    { id: "chat" as const, icon: MessageCircle, label: t("team.chat") },
    { id: "calendar" as const, icon: CalendarDays, label: t("team.calendar") },
    { id: "tasks" as const, icon: CheckSquare, label: t("team.tasks") },
  ];
  const members = {
    id: "members" as const,
    icon: Users,
    label: t("team.members"),
  };

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center border-r border-stone-200 bg-white py-4">
      <div className="flex flex-col items-center gap-2">
        {primary.map((item) => (
          <RailButton
            key={item.id}
            active={section === item.id}
            label={item.label}
            icon={item.icon}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
      <div className="mt-auto">
        <RailButton
          active={section === members.id}
          label={members.label}
          icon={members.icon}
          onClick={() => onChange(members.id)}
        />
      </div>
    </nav>
  );
}
