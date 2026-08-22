"use client";

import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { useCreateGroupDialog } from "@/app/collaboration/_hooks/use-create-group-dialog";
import { flatFieldClass } from "@/lib/shared/form-field-styles";
import { cn } from "@/lib/shared/utils";

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
  const {
    name,
    setName,
    selectedIds,
    search,
    setSearch,
    filteredMembers,
    toggleMember,
    handleClose,
    handleSubmit,
    t,
  } = useCreateGroupDialog(open, members, currentUserId, onClose, onCreate);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        className="flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 pt-5 pb-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-stone-400 uppercase">
              {t("team.newConversation")}
            </p>
            <h2
              id="create-group-title"
              className="mt-1 text-2xl font-bold tracking-tight text-stone-900"
            >
              {t("team.createGroup")}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{t("team.groupHint")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-stone-200 px-6 py-5">
              <label
                htmlFor="create-group-name"
                className="block text-sm font-bold text-stone-900"
              >
                {t("team.groupName")}
              </label>
              <input
                id="create-group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("team.groupNamePlaceholder")}
                autoFocus
                className={cn(
                  flatFieldClass,
                  "mt-2 h-11 text-base focus:border-blue-600"
                )}
              />
            </div>

            <div className="px-6 pt-5 pb-2">
              <p className="text-sm font-bold text-stone-900">
                {t("team.groupMembers")}
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="text-sm text-stone-500">
                  {t("team.selectPeopleToAdd")}
                </p>
                <p className="shrink-0 text-sm text-stone-500">
                  {t("team.selectedCount", { count: selectedIds.length })}
                </p>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("team.searchGroupMembers")}
                  className={cn(
                    flatFieldClass,
                    "h-10 pl-7 focus:border-blue-600"
                  )}
                />
              </div>
            </div>

            <div className="px-6 pb-2">
              {filteredMembers.length === 0 ? (
                <p className="py-10 text-center text-sm text-stone-400">
                  {t("team.noMembersFound")}
                </p>
              ) : (
                <ul>
                  {filteredMembers.map((member) => {
                    const selected = selectedIds.includes(member.id);
                    return (
                      <li key={member.id} className="border-b border-stone-100 last:border-b-0">
                        <label className="flex cursor-pointer items-center gap-3 py-3.5">
                          <PersonAvatar
                            name={member.name}
                            imageUrl={member.imageUrl}
                            size="md"
                            letters={2}
                            className="ring-0!"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-stone-900">
                              {member.name}
                            </span>
                            <span className="block truncate text-xs text-stone-500">
                              {member.email}
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleMember(member.id)}
                            className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-200 px-6 py-4">
            <p className="min-w-0 text-xs leading-relaxed text-stone-400">
              {t("team.membersNotifiedHint")}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="h-10 px-3 text-sm font-medium text-stone-500 transition hover:text-stone-800"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim() || selectedIds.length === 0}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {t("team.createGroup")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
