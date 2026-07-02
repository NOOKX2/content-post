"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { ContentDetail } from "@/components/content/content-detail";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { downloadContentPdf } from "@/lib/content/export-pdf-client";
import { contentPdfFilename } from "@/lib/content/pdf-filename";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

function ContentDetailSubNav({
  contentId,
  name,
  onExport,
  exporting,
  session,
}: {
  contentId?: string;
  name?: string;
  onExport?: () => void;
  exporting?: boolean;
  session?: Session | null;
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
  content,
  session,
}: {
  content: ContentItem;
  session: Session | null;
}) {
  const [exporting, setExporting] = useState(false);

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

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      <ContentDetailSubNav
        contentId={content.contentId}
        name={content.name}
        onExport={handleExportPdf}
        exporting={exporting}
        session={session}
      />
      <ContentDetail content={content} />
    </div>
  );
}
