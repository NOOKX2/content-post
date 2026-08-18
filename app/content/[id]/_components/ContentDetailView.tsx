"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  FileDown,
  Link2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { ContentForm } from "@/app/create/_components/form/ContentForm";
import { ContentHistoryPanel } from "@/app/content/[id]/_components/ContentHistoryPanel";
import { ContentComments } from "@/app/content/[id]/_components/ContentComments";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/Button";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { downloadContentPdf } from "@/lib/content/pdf/export-client";
import { contentPdfFilename } from "@/lib/content/pdf/filename";
import {
  deleteContent,
  approveContent,
  rejectContent,
} from "@/lib/content/actions";
import { updatePostUrl } from "@/lib/content/actions/mutate";
import {
  canDeleteContent,
  canEditContent,
} from "@/lib/content/domain/permissions";
import { isAdminRole } from "@/lib/auth/domain/roles";
import { useContents } from "@/lib/content/client/contents-provider";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import { isImageAttachment } from "@/lib/content/domain/attachments";
import { isVideoMediaUrl } from "@/lib/content/domain/media-url";
import { cn } from "@/lib/shared/utils";
import { formatLocalizedDate, statusLabel, useT } from "@/lib/i18n";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContentItem["status"], { dotClass: string; labelClass: string }> = {
  draft: {
    dotClass: "bg-stone-400",
    labelClass: "text-stone-600",
  },
  pending: {
    dotClass: "bg-amber-400 animate-pulse",
    labelClass: "text-amber-600",
  },
  idea_approved: {
    dotClass: "bg-sky-400",
    labelClass: "text-sky-600",
  },
  clip_pending: {
    dotClass: "bg-orange-400 animate-pulse",
    labelClass: "text-orange-600",
  },
  approved: {
    dotClass: "bg-emerald-400",
    labelClass: "text-emerald-600",
  },
  scheduled: {
    dotClass: "bg-sky-400",
    labelClass: "text-sky-600",
  },
  posting: {
    dotClass: "bg-amber-400 animate-pulse",
    labelClass: "text-amber-600",
  },
  posted: {
    dotClass: "bg-emerald-400",
    labelClass: "text-emerald-600",
  },
  post_failed: {
    dotClass: "bg-red-400",
    labelClass: "text-red-600",
  },
  rejected: {
    dotClass: "bg-red-400",
    labelClass: "text-red-600",
  },
};

// ─── Post link section ────────────────────────────────────────────────────────

function PostLinkSection({
  content,
  canEdit,
  onSaved,
}: {
  content: ContentItem;
  canEdit: boolean;
  onSaved: (updated: ContentItem) => void;
}) {
  const { t } = useT();
  const [url, setUrl] = useState(content.postUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDirty = url !== (content.postUrl ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updatePostUrl(content.id, url);
      if (result.success) {
        onSaved(result.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-stone-400 uppercase">
        <Link2 className="h-3 w-3" />
        {t("content.postLinkLabel")}
      </p>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={!canEdit}
            placeholder={t("content.postLinkPlaceholder")}
            className={cn(
              "h-9 w-full rounded-lg border px-3 pr-9 text-sm outline-none transition",
              canEdit
                ? "border-stone-200 bg-white text-stone-900 placeholder:text-stone-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                : "border-stone-100 bg-stone-50 text-stone-500 cursor-default"
            )}
          />
          {url && (
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-stone-400 hover:text-stone-600"
              title={t("content.copyLink")}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:text-stone-800 transition"
            title={t("content.openLink")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {canEdit && isDirty && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "..." : t("common.save")}
          </Button>
        )}
      </div>
      {url && (
        <p className="text-[11px] text-stone-400">
          {t("content.postLinkHint")}
        </p>
      )}
    </div>
  );
}

// ─── Assignment details ───────────────────────────────────────────────────────

function AssignmentDetails({ content }: { content: ContentItem }) {
  const { t, locale } = useT();
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const scheduleLabel = content.scheduledDate
    ? `${formatLocalizedDate(content.scheduledDate, locale)}${content.scheduledTime ? ` · ${content.scheduledTime}` : ""}`
    : null;

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (content.channel)
    rows.push({
      label: t("create.channel"),
      value: (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              mediaConfig.accentBg.replace("bg-", "bg-")
            )}
          />
          {content.channel}
        </span>
      ),
    });
  if (content.ideaCreator)
    rows.push({
      label: t("content.createdBy"),
      value: (
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
            {content.ideaCreator.charAt(0)}
          </span>
          <span className="text-sm text-stone-800">{content.ideaCreator}</span>
        </span>
      ),
    });
  if (scheduleLabel)
    rows.push({ label: t("content.postDate"), value: scheduleLabel });
  if (content.category)
    rows.push({
      label: t("content.category"),
      value: (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {content.category}
        </span>
      ),
    });
  if (content.platforms.length > 0)
    rows.push({
      label: t("content.platforms"),
      value: <PlatformBadgeGroup platforms={content.platforms} size="sm" />,
    });
  if (content.approver)
    rows.push({ label: t("content.approvedBy"), value: content.approver });

  return (
    <div className="space-y-0.5">
      <p className="mb-2 text-[10px] font-semibold tracking-widest text-stone-400 uppercase">
        {t("content.assignmentDetails")}
      </p>
      <dl className="divide-y divide-stone-100">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 py-2"
          >
            <dt className="shrink-0 text-xs text-stone-500">{label}</dt>
            <dd className="text-right text-xs text-stone-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Post objective / details ─────────────────────────────────────────────────

function PostObjective({ content }: { content: ContentItem }) {
  const { t } = useT();
  if (!content.details) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold tracking-widest text-stone-400 uppercase">
        {t("content.objectiveTitle")}
      </p>
      <p className="text-sm leading-relaxed text-stone-600">
        {content.details}
      </p>
    </div>
  );
}

// ─── Hero media (left column) ─────────────────────────────────────────────────

function HeroMediaPanel({ content }: { content: ContentItem }) {
  const { t } = useT();
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const heroUrl = content.attachments.find((url) => url.trim()) ?? "";
  const heroIsVideo = heroUrl ? isVideoMediaUrl(heroUrl) : false;
  const heroIsImage = heroUrl ? isImageAttachment(heroUrl) : false;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
      {heroIsVideo ? (
        <video
          src={heroUrl}
          poster={content.coverImage || undefined}
          controls
          className="aspect-4/5 w-full bg-black object-contain sm:aspect-video"
          preload="metadata"
        />
      ) : heroIsImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroUrl}
          alt={content.name}
          className="aspect-4/5 w-full object-cover sm:aspect-video"
        />
      ) : (
        <div
          className={cn(
            "flex aspect-video w-full flex-col items-center justify-center gap-2",
            mediaConfig.accentBg
          )}
        >
          <p className="text-sm text-stone-500">{t("content.previewMissing")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Caption preview ──────────────────────────────────────────────────────────

function CaptionPreview({ content }: { content: ContentItem }) {
  const { t } = useT();
  const caption = content.details;
  if (!caption) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-stone-400 uppercase">
        {t("content.captionPreview")}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
        {caption}
      </p>
      {content.tags.length > 0 && (
        <p className="mt-3 text-sm text-blue-500">
          {content.tags.map((t) => `#${t}`).join(" ")}
        </p>
      )}
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButtons({
  content,
  session,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  deleting,
  approving,
  rejecting,
  exporting,
  onExport,
}: {
  content: ContentItem;
  session: Session | null;
  onEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
  deleting: boolean;
  approving: boolean;
  rejecting: boolean;
  exporting: boolean;
  onExport: () => void;
}) {
  const { t } = useT();
  const showEdit = canEditContent(session, content);
  const showDelete = canDeleteContent(session, content);
  const isAdmin = isAdminRole(session?.user?.role);
  const canApprove =
    isAdmin &&
    (content.status === "pending" || content.status === "clip_pending");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
          <FileDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {exporting ? t("common.loading") : t("common.exportPdf")}
          </span>
        </Button>
      )}
      {showDelete && (
        <Button variant="danger" size="sm" onClick={onDelete} disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {deleting ? t("content.deleting") : t("common.delete")}
          </span>
        </Button>
      )}
      {showEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("content.editDraft")}</span>
        </Button>
      )}
      {canApprove && (
        <>
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
            disabled={rejecting}
          >
            <X className="h-3.5 w-3.5" />
            <span>{rejecting ? "…" : t("content.reject")}</span>
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={onApprove}
            disabled={approving}
          >
            <Check className="h-3.5 w-3.5" />
            <span>{approving ? "…" : t("content.approve")}</span>
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ContentDetailView({
  content: initialContent,
  session,
}: {
  content: ContentItem;
  session: Session | null;
}) {
  const { t } = useT();
  const [content, setContent] = useState(initialContent);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const { mutateContents } = useContents();
  const { navigate } = useDashboardNav();

  const statusCfg = STATUS_CONFIG[content.status];
  const statusText = statusLabel(t, content.status);

  const handleExportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await downloadContentPdf(content.id, contentPdfFilename(content));
    } catch (error) {
      alert(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const confirmed = window.confirm(
      t("content.deleteConfirm", { name: content.name, id: content.contentId })
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
      alert(t("content.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async () => {
    if (approving) return;
    setApproving(true);
    try {
      const result = await approveContent(content.id);
      if (result.success) setContent(result.data);
      else alert(result.error);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (rejecting) return;
    const note = window.prompt(t("content.rejectPrompt"));
    if (note === null) return; // cancelled
    setRejecting(true);
    try {
      const result = await rejectContent(content.id, note || undefined);
      if (result.success) setContent(result.data);
      else alert(result.error);
    } finally {
      setRejecting(false);
    }
  };

  const handleSaved = useCallback((updated: ContentItem) => {
    setContent(updated);
    setEditing(false);
  }, []);

  if (editing) {
    return (
      <div className="min-h-full bg-[#f5f5f7]">
        {/* Edit sub-nav */}
        <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f5f5f7]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <NotificationBell />
              <UserMenu session={session} />
            </div>
          </div>
        </nav>
        <div className="px-4 py-6 sm:px-6 lg:px-6">
          <ContentForm
            key={content.id}
            initialContent={content}
            onCancel={() => setEditing(false)}
            onSaved={handleSaved}
          />
        </div>
      </div>
    );
  }

  const canEdit = canEditContent(session, content);

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f5f5f7]/90 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex min-w-0 items-center gap-2 text-xs text-stone-500">
            <button
              type="button"
              onClick={() => navigate("/calendar")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <span className="hidden font-semibold uppercase tracking-wide sm:inline">
              {statusText}
            </span>
            <ChevronRight className="hidden h-3 w-3 sm:block" />
            <span className="hidden font-mono text-stone-400 sm:inline">
              {t("content.contentIdLabel")}: #{content.contentId}
            </span>
          </div>

          {/* Right: actions + user */}
          <div className="flex shrink-0 items-center gap-2">
            <ActionButtons
              content={content}
              session={session}
              onEdit={() => setEditing(true)}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              deleting={deleting}
              approving={approving}
              rejecting={rejecting}
              exporting={exporting}
              onExport={handleExportPdf}
            />
            <NotificationBell />
            <UserMenu session={session} />
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Title row */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {content.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
                statusCfg.labelClass,
                "bg-white border border-stone-200 shadow-sm"
              )}
            >
              <span
                className={cn("h-2 w-2 rounded-full", statusCfg.dotClass)}
              />
              {statusText}
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── LEFT: media + caption ── */}
          <div className="space-y-4">
            <HeroMediaPanel content={content} />
            <CaptionPreview content={content} />
          </div>

          {/* ── RIGHT: sidebar panels ── */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* Assignment Details */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <AssignmentDetails content={content} />
            </div>

            {/* Post Link */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <PostLinkSection
                content={content}
                canEdit={canEdit}
                onSaved={setContent}
              />
            </div>

            {/* Post objective */}
            {content.details && (
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <PostObjective content={content} />
              </div>
            )}

            {/* Version History */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <ContentHistoryPanel contentId={content.id} variant="timeline" />
            </div>

            {/* Review Comments */}
            <ContentComments contentId={content.id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
