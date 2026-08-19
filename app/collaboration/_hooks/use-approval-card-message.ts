"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { resolveApproval } from "@/lib/collaboration/actions/fetch";
import { useT } from "@/lib/i18n";

export function useApprovalCardMessage(
  messageId: string,
  metadata: ApprovalCardMetadata,
  onResolved?: () => void
) {
  const { data: session } = useSession();
  const { t, locale } = useT();
  const isAdmin = session?.user?.role === "ADMIN";
  const isPending = metadata.status === "pending";

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    if (busy || !isPending) return;
    if (!confirm(t("team.confirmApprove", { id: metadata.contentCode, name: metadata.contentName }))) return;
    setBusy(true);
    try {
      await resolveApproval(messageId, "approve");
      onResolved?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.approveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (busy || !isPending) return;
    const reason = rejectReason.trim();
    if (!reason) { alert(t("team.rejectReasonRequired")); return; }
    setBusy(true);
    try {
      await resolveApproval(messageId, "reject", reason);
      setShowRejectForm(false);
      setRejectReason("");
      onResolved?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.rejectFailed"));
    } finally {
      setBusy(false);
    }
  };

  return {
    isAdmin,
    isPending,
    busy,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason,
    handleApprove,
    handleReject,
    t,
    locale,
  };
}
