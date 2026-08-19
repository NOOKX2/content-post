"use client";

import { useEffect, useMemo, useState } from "react";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { useT } from "@/lib/i18n";

export function useCreateGroupDialog(
  open: boolean,
  members: TeamMemberItem[],
  currentUserId: string | undefined,
  onClose: () => void,
  onCreate: (payload: { name: string; memberIds: string[] }) => void
) {
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
    () => members.filter((m) => m.id !== currentUserId),
    [members, currentUserId]
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return selectableMembers;
    return selectableMembers.filter(
      (m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
    );
  }, [search, selectableMembers]);

  const toggleMember = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
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

  return {
    name, setName,
    selectedIds,
    search, setSearch,
    filteredMembers,
    toggleMember,
    handleClose,
    handleSubmit,
    t,
  };
}
