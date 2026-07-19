"use client";

import { useState } from "react";
import { FileDown, Pencil, Trash2 } from "lucide-react";
import { ContentDetail } from "@/components/content/content-detail";
import { ContentComments } from "@/components/content/content-comments";
import { ContentHistoryPanel } from "@/components/content/content-history-panel";
import { TeamTasksPanel } from "@/components/collaboration/team-tasks-panel";
import { ContentForm } from "@/components/content/content-form";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { downloadContentPdf } from "@/lib/content/export-pdf-client";
import { contentPdfFilename } from "@/lib/content/pdf-filename";
import { deleteContent } from "@/lib/content/actions";
import {
  canDeleteContent,
  canEditContent,
} from "@/lib/content/permissions";
import { useContents } from "@/lib/content/contents-provider";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

function ContentDetailSubNav({
  session,
  onExport,
  exporting,
  onDelete,
  deleting,
  showDelete,
}: {
  session?: Session | null;
  onExport?: () => void;
  exporting?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  showDelete?: boolean;
}) {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-stone-200/80 bg-[#f5f5f7]/90 px-4 py-3 backdrop-blur md:px-8">
      <p className="text-sm font-semibold text-stone-800">รายละเอียด Content</p>
      <div className="flex shrink-0 items-center gap-2">
        {showDelete && onDelete && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "กำลังลบ..." : "ลบ"}
          </Button>
        )}
        {onExport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={exporting}
          >
            <FileDown className="h-4 w-4" />
            {exporting ? "กำลังส่งออก..." : "Export PDF"}
          </Button>
        )}
        <NotificationBell />
        <UserMenu session={session ?? null} />
      </div>
    </nav>
  );
}

export function ContentDetailView({
  content: initialContent,
  session,
}: {
  content: ContentItem;
  session: Session | null;
}) {
  const [content, setContent] = useState(initialContent);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { mutateContents } = useContents();
  const { navigate } = useDashboardNav();

  const showEdit = canEditContent(session, content);
  const showDelete = canDeleteContent(session, content);

  const handleExportPdf = async () => {
    if (exporting) return;

    setExporting(true);
    try {
      await downloadContentPdf(content.id, contentPdfFilename(content));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "ส่งออก PDF ไม่สำเร็จ กรุณาลองใหม่"
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      `ลบ Content "${content.name}" (#${content.contentId})?\n\nการลบไม่สามารถย้อนกลับได้`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await deleteContent(content.id);
      if (!result.success) {
        alert(result.error);
        return;
      }

      await mutateContents(
        (current = []) => current.filter((item) => item.id !== content.id),
        { revalidate: true }
      );
      navigate("/calendar");
    } catch {
      alert("ลบ Content ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (updated: ContentItem) => {
    setContent(updated);
    setEditing(false);
  };

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      <ContentDetailSubNav
        session={session}
        onExport={editing ? undefined : () => void handleExportPdf()}
        exporting={exporting}
        onDelete={handleDelete}
        deleting={deleting}
        showDelete={!editing && showDelete}
      />

      {editing ? (
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
          <ContentForm
            key={content.id}
            initialContent={content}
            onCancel={() => setEditing(false)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-10 md:px-8">
          <ContentDetail content={content} />

          <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-stone-900">
              มอบหมายงาน
            </h3>
            <TeamTasksPanel contentId={content.id} compact />
          </section>

          <ContentComments contentId={content.id} />

          <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <ContentHistoryPanel contentId={content.id} />
          </section>

          {showEdit && (
            <div className="pt-1">
              <Button
                type="button"
                className="h-12 w-full rounded-xl text-base font-semibold"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                แก้ไข Content
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
