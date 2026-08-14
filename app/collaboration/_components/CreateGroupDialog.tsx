"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

export function CreateGroupDialog({
  open,
  members,
  currentUserId,
  submitting,
  onClose,
  onCreate,
}: {
  open: boolean;
  members: TeamMemberItem[];
  currentUserId?: string;
  submitting: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; memberIds: string[] }) => void;
}) {
  const { t } = useT();
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedIds([]);
      setSearch("");
    }
  }, [open]);

  const selectableMembers = useMemo(
    () => members.filter((member) => member.id !== currentUserId),
    [members, currentUserId]
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return selectableMembers;
    return selectableMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
  }, [search, selectableMembers]);

  const toggleMember = (memberId: string) => {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const handleClose = () => {
    setName("");
    setSelectedIds([]);
    setSearch("");
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onCreate({ name: name.trim(), memberIds: selectedIds });
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2
              id="create-group-title"
              className="text-base font-semibold text-stone-900"
            >
              {t("team.createGroup")}
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              {t("team.groupHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <Input
            label={t("team.groupName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("team.groupNamePlaceholder")}
            autoFocus
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              {t("team.groupMembers")}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("team.searchMembers")}
                className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pr-3 pl-8 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-stone-200 p-2">
              {filteredMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-400">
                  {t("team.noMembersFound")}
                </p>
              ) : (
                filteredMembers.map((member) => {
                  const selected = selectedIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        selected
                          ? "bg-blue-50 ring-1 ring-blue-200"
                          : "hover:bg-stone-50"
                      )}
                    >
                      <PersonAvatar name={member.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                          {member.email}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-stone-300 bg-white"
                        )}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-xs text-stone-500">
              {t("team.selectedPeople", { count: selectedIds.length })}
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim() || selectedIds.length === 0}
            >
              {t("team.createGroup")}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
