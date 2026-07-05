"use client";

import { useState } from "react";
import { FileDown, Pencil, Trash2 } from "lucide-react";
import { ContentDetail } from "@/components/content/content-detail";
import { ContentForm } from "@/components/content/content-form";
import { UserMenu } from "@/components/layout/user-menu";
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
  contentId,
  name,
  onExport,
  exporting,
  session,
  onEdit,
  onDelete,
  deleting,
  showEdit,
  showDelete,
}: {
  contentId?: string;
  name?: string;
  onExport?: () => void;
  exporting?: boolean;
  session?: Session | null;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}) {
  return (
    <nav className="apple-sub-nav apple-detail gap-3">
      <div className="min-w-0 flex-1 text-center">
        <p className="apple-caption-strong truncate text-[#1d1d1f]">
          รายละเอียด Content
        </p>
        {(contentId || name) && (
          <p className="apple-fine-print mt-0.5 truncate">
            {contentId ? `#${contentId}` : ""}
            {contentId && name ? " — " : ""}
            {name ?? ""}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showEdit && onEdit && (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            แก้ไข
          </Button>
        )}
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
    } catch {
      alert("ส่งออก PDF ไม่สำเร็จ กรุณาลองใหม่");
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
        contentId={content.contentId}
        name={content.name}
        onExport={editing ? undefined : handleExportPdf}
        exporting={exporting}
        session={session}
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        deleting={deleting}
        showEdit={!editing && showEdit}
        showDelete={!editing && showDelete}
      />

      {editing ? (
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
          <ContentForm
            key={content.id}
            initialContent={content}
            onCancel={() => setEditing(false)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <ContentDetail content={content} />
      )}
    </div>
  );
}
