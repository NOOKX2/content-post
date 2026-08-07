"use client";

import { useState } from "react";
import { ArrowLeft, FileDown, ListChecks, Pencil, Trash2 } from "lucide-react";
import { ContentDetail } from "@/app/content/[id]/_components/ContentDetail";
import { ContentDetailSidebar } from "@/app/content/[id]/_components/ContentDetailSidebar";
import { ContentComments } from "@/app/content/[id]/_components/ContentComments";
import { TeamTasksPanel } from "@/app/collaboration/_components/TeamTasksPanel";
import { ContentForm } from "@/app/create/_components/ContentForm";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/Button";
import { downloadContentPdf } from "@/lib/content/pdf/export-client";
import { contentPdfFilename } from "@/lib/content/pdf/filename";
import { deleteContent } from "@/lib/content/actions";
import {
  canDeleteContent,
  canEditContent,
} from "@/lib/content/domain/permissions";
import { useContents } from "@/lib/content/client/contents-provider";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

function ContentDetailSubNav({
  session,
  onBack,
  onExport,
  exporting,
  onEdit,
  showEdit,
  onDelete,
  deleting,
  showDelete,
}: {
  session?: Session | null;
  onBack: () => void;
  onExport?: () => void;
  exporting?: boolean;
  onEdit?: () => void;
  showEdit?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  showDelete?: boolean;
}) {
  return (
    <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f5f5f7]/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50"
            aria-label="กลับ"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800">
              รายละเอียด Content
            </p>
            <p className="text-[11px] text-stone-400">
              Content Hub / ดูรายละเอียด
            </p>
          </div>
        </div>
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
              <span className="hidden sm:inline">
                {deleting ? "กำลังลบ..." : "ลบ"}
              </span>
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
              <span className="hidden sm:inline">
                {exporting ? "กำลังส่งออก..." : "Export PDF"}
              </span>
            </Button>
          )}
          {showEdit && onEdit && (
            <Button type="button" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">แก้ไข</span>
            </Button>
          )}
          <NotificationBell />
          <UserMenu session={session ?? null} />
        </div>
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
        onBack={() => navigate("/calendar")}
        onExport={editing ? undefined : () => void handleExportPdf()}
        exporting={exporting}
        onEdit={() => setEditing(true)}
        showEdit={!editing && showEdit}
        onDelete={handleDelete}
        deleting={deleting}
        showDelete={!editing && showDelete}
      />

      {editing ? (
        <div className="px-4 py-6 sm:px-6 lg:px-6">
          <div className="w-full max-w-none">
            <ContentForm
              key={content.id}
              initialContent={content}
              onCancel={() => setEditing(false)}
              onSaved={handleSaved}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 pb-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4">
            <ContentDetail content={content} />

            <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ListChecks className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  มอบหมายงาน
                </h3>
              </div>
              <TeamTasksPanel contentId={content.id} compact />
            </section>

            <ContentComments contentId={content.id} />
          </div>

          <ContentDetailSidebar content={content} />
        </div>
      )}
    </div>
  );
}
