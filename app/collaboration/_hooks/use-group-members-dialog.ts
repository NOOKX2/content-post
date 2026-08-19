"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import {
  fetchGroupMembers,
  inviteGroupMembers,
  leaveGroupChannel,
} from "@/lib/collaboration/actions/fetch";
import { useT } from "@/lib/i18n";

export function useGroupMembersDialog(
  open: boolean,
  channelId: string,
  groupName: string,
  teamMembers: TeamMemberItem[],
  onMembersChanged: () => void,
  onLeft: () => void
) {
  const { t } = useT();
  const [inviteMode, setInviteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { data: members = [], mutate, isLoading } = useSWR(
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
    () => new Set(members.map((m) => m.id)),
    [members]
  );

  const invitableMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teamMembers.filter((m) => {
      if (memberIdSet.has(m.id)) return false;
      if (!query) return true;
      return m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query);
    });
  }, [teamMembers, memberIdSet, search]);

  const toggleMember = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
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
      alert(error instanceof Error ? error.message : t("team.inviteFailed"));
    } finally {
      setInviting(false);
    }
  };

  const handleLeave = async () => {
    if (leaving) return;
    if (!confirm(t("team.leaveGroupConfirm", { name: groupName }))) return;
    setLeaving(true);
    try {
      await leaveGroupChannel(channelId);
      onLeft();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.leaveFailed"));
    } finally {
      setLeaving(false);
    }
  };

  return {
    // data
    members,
    isLoading,
    invitableMembers,
    // invite mode
    inviteMode,
    setInviteMode,
    selectedIds,
    toggleMember,
    search,
    setSearch,
    inviting,
    handleInvite,
    // leave
    leaving,
    handleLeave,
    t,
  };
}
