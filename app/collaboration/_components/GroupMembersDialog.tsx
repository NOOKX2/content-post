"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import useSWR from "swr";
import { LogOut, Search, UserPlus, X } from "lucide-react";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import {
  fetchGroupMembers,
  inviteGroupMembers,
  leaveGroupChannel,
} from "@/lib/collaboration/actions/fetch";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/shared/utils";

export function GroupMembersDialog({
  open,
  channelId,
  groupName,
  teamMembers,
  currentUserId,
  onClose,
  onMembersChanged,
  onLeft,
}: {
  open: boolean;
  channelId: string;
  groupName: string;
  teamMembers: TeamMemberItem[];
  currentUserId?: string;
  onClose: () => void;
  onMembersChanged: () => void;
  onLeft: () => void;
}) {
  const [inviteMode, setInviteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const {
    data: members = [],
    mutate,
    isLoading,
  } = useSWR(
    open ? `group-members:${channelId}` : null,
    () => fetchGroupMembers(channelId)
  );

  useEffect(() => {
    if (!open) {
      setInviteMode(false);
      setSelectedIds([]);
      setSearch("");
    }
  }, [open]);

  const memberIdSet = useMemo(
    () => new Set(members.map((member) => member.id)),
    [members]
  );

  const invitableMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teamMembers.filter((member) => {
      if (memberIdSet.has(member.id)) return false;
      if (!query) return true;
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    });
  }, [teamMembers, memberIdSet, search]);

  const toggleMember = (memberId: string) => {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const handleInvite = async () => {
    if (selectedIds.length === 0 || inviting) return;
    setInviting(true);
    try {
      await inviteGroupMembers(channelId, selectedIds);
      await mutate();
      setSelectedIds([]);
      setSearch("");
      setInviteMode(false);
      onMembersChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : "เชิญสมาชิกไม่สำเร็จ");
    } finally {
      setInviting(false);
    }
  };

  const handleLeave = async () => {
    if (leaving) return;
    if (!confirm(`ออกจากกลุ่ม "${groupName}"?`)) return;
    setLeaving(true);
    try {
      await leaveGroupChannel(channelId);
      onLeft();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ออกจากกลุ่มไม่สำเร็จ");
    } finally {
      setLeaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-members-title"
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="group-members-title"
              className="truncate text-base font-semibold text-stone-900"
            >
              {inviteMode ? "เชิญสมาชิก" : "สมาชิกในกลุ่ม"}
            </h2>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {inviteMode
                ? `เพิ่มสมาชิกเข้ากลุ่ม "${groupName}"`
                : `${members.length} สมาชิก`}
            </p>
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

        {inviteMode ? (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาสมาชิก..."
                  className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pr-3 pl-8 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                {invitableMembers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">
                    ไม่มีสมาชิกให้เชิญ
                  </p>
                ) : (
                  invitableMembers.map((member) => {
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
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInviteMode(false);
                  setSelectedIds([]);
                  setSearch("");
                }}
              >
                ย้อนกลับ
              </Button>
              <Button
                type="button"
                onClick={() => void handleInvite()}
                disabled={inviting || selectedIds.length === 0}
              >
                เชิญ {selectedIds.length > 0 ? `${selectedIds.length} คน` : ""}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 space-y-1 overflow-y-auto p-5">
              {isLoading ? (
                <p className="py-6 text-center text-sm text-stone-400">
                  กำลังโหลด...
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2"
                  >
                    <PersonAvatar name={member.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {member.name}
                        {member.id === currentUserId && (
                          <span className="ml-1 text-xs text-stone-400">
                            (คุณ)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {member.email}
                      </p>
                    </div>
                    {member.isCreator && (
                      <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                        ผู้สร้าง
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-stone-100 px-5 py-4">
              <Button
                type="button"
                variant="danger"
                onClick={() => void handleLeave()}
                disabled={leaving}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                ออกจากกลุ่ม
              </Button>
              <Button type="button" onClick={() => setInviteMode(true)}>
                <UserPlus className="mr-1.5 h-4 w-4" />
                เชิญสมาชิก
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
