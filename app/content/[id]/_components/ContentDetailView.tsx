"use client";

import { useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  CalendarDays,
  ExternalLink,
  FileDown,
  Link2,
  Play,
  Pencil,
  Package,
  ShieldCheck,
  Tag,
  User,
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

function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

// ─── Post link section ────────────────────────────────────────────────────────

function PostLinkSection({
  content,
  canEdit,
  onSaved,
  theme = "light",
}: {
  content: ContentItem;
  canEdit: boolean;
  onSaved: (updated: ContentItem) => void;
  theme?: "light" | "dark";
}) {
  const { t } = useT();
  const isDark = theme === "dark";
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
      <p
        className={cn(
          "flex items-center gap-1.5 text-sm font-semibold tracking-wide",
          isDark ? "text-stone-300" : "text-stone-800"
        )}
      >
        <Link2 className="h-4 w-4" />
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
              "h-10 w-full rounded-lg border px-3 pr-9 text-base outline-none transition",
              canEdit
                ? isDark
                  ? "border-stone-800 bg-stone-950/40 text-stone-100 placeholder:text-stone-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  : "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                : isDark
                  ? "border-stone-800 bg-stone-950/20 text-stone-500 cursor-default"
                  : "border-stone-100 bg-stone-50 text-stone-600 cursor-default"
            )}
          />
          {url && (
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 transition",
                isDark ? "text-stone-500 hover:text-stone-200" : "text-stone-400 hover:text-stone-600"
              )}
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
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition",
              isDark
                ? "border-stone-800 bg-stone-950/40 text-stone-300 hover:bg-stone-900/50 hover:text-stone-100"
                : "border-stone-200 bg-white text-stone-500 hover:text-stone-800"
            )}
            title={t("content.openLink")}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {canEdit && isDirty && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "..." : t("common.save")}
          </Button>
        )}
      </div>
      {url && (
        <p className={cn("text-[11px]", isDark ? "text-stone-500" : "text-stone-400")}>
          {t("content.postLinkHint")}
        </p>
      )}
    </div>
  );
}

// ─── Assignment details ───────────────────────────────────────────────────────

function AssignmentDetails({
  content,
  theme = "light",
}: {
  content: ContentItem;
  theme?: "light" | "dark";
}) {
  const { t, locale } = useT();
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const isDark = theme === "dark";
  const scheduleLabel = content.scheduledDate
    ? `${formatLocalizedDate(content.scheduledDate, locale)}${content.scheduledTime ? ` · ${content.scheduledTime}` : ""}`
    : null;

  const rows: Array<{
    label: string;
    value: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }> = [];

  // Match reference layout: icon + label (left) and value (right).
  if (content.ideaCreator) {
    rows.push({
      label: t("content.createdBy"),
      value: (
        <span className="text-base font-semibold text-stone-900">
          {content.ideaCreator}
        </span>
      ),
      icon: User,
    });
  }

  if (scheduleLabel) {
    rows.push({
      label: t("content.postDate"),
      value: (
        <span className="text-base font-medium text-stone-900">
          {scheduleLabel}
        </span>
      ),
      icon: CalendarDays,
    });
  }

  if (content.category) {
    rows.push({
      label: t("content.category"),
      value: (
        <span className="text-base font-semibold text-emerald-700">
          {content.category}
        </span>
      ),
      icon: Tag,
    });
  }

  if (content.platforms.length > 0) {
    rows.push({
      label: t("content.platforms"),
      value: <PlatformBadgeGroup platforms={content.platforms} size="sm" />,
      icon: Package,
    });
  }

  if (content.approver) {
    rows.push({
      label: t("content.approvedBy"),
      value: (
        <span className="text-base font-medium text-stone-900">
          {content.approver}
        </span>
      ),
      icon: ShieldCheck,
    });
  }

  return (
    <div className="space-y-0.5">
      <p
        className={cn(
          "mb-2 text-sm font-bold tracking-wide",
          isDark ? "text-stone-200" : "text-stone-900"
        )}
      >
        {t("content.assignmentDetails")}
      </p>
      <div className={cn("divide-y", isDark ? "divide-stone-800" : "divide-stone-100")}>
        {rows.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between gap-6 py-3">
            <dt
              className={cn(
                "flex shrink-0 items-center gap-2 text-sm font-semibold",
                isDark ? "text-stone-200" : "text-stone-800"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isDark ? "text-stone-400" : "text-stone-700"
                  )}
                />
              )}
              {label}
            </dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Post objective / details ─────────────────────────────────────────────────

function PostObjective({
  content,
  theme = "light",
}: {
  content: ContentItem;
  theme?: "light" | "dark";
}) {
  const { t } = useT();
  const isDark = theme === "dark";
  if (!content.details) return null;
  return (
    <div className="space-y-1.5">
      <p
        className={cn(
          "text-sm font-bold tracking-wide",
          isDark ? "text-stone-200" : "text-stone-900"
        )}
      >
        {t("content.objectiveTitle")}
      </p>
      <p
        className={cn(
          "text-base leading-relaxed",
          isDark ? "text-stone-100" : "text-stone-800"
        )}
      >
        {content.details}
      </p>
    </div>
  );
}

// ─── Hero media (left column) ─────────────────────────────────────────────────

function HeroMediaPanel({
  content,
  theme = "light",
}: {
  content: ContentItem;
  theme?: "light" | "dark";
}) {
  const { t } = useT();
  const isDark = theme === "dark";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [durationText, setDurationText] = useState("0:00");
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const heroUrl = content.attachments.find((url) => url.trim()) ?? "";
  const heroIsVideo = heroUrl ? isVideoMediaUrl(heroUrl) : false;
  const heroIsImage = heroUrl ? isImageAttachment(heroUrl) : false;

  const handleLoadedMetadata = () => {
    const duration = videoRef.current?.duration;
    if (duration == null || !Number.isFinite(duration)) return;
    setDurationText(formatVideoDuration(duration));
  };

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        await el.play();
        setIsPlaying(true);
      } else {
        el.pause();
        setIsPlaying(false);
      }
    } catch {
      // ignore autoplay/play restrictions; UI still should work
    }
  };

  return (
    <div className="overflow-hidden">
      {heroIsVideo ? (
        <div className="relative">
          <video
            ref={videoRef}
            src={heroUrl}
            poster={content.coverImage || undefined}
            controls={false}
            className={cn(
              "aspect-video w-full bg-black object-cover"
            )}
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
          />
          {/* Always render green-tint + play badge (matches the reference UI). */}
          <div className="pointer-events-none absolute inset-0 bg-emerald-500/15" />
          <button
            type="button"
            onClick={togglePlay}
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded border border-stone-600/20 bg-black/50 px-3 py-2 text-[11px] font-medium text-stone-50 backdrop-blur"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <Play className="h-3.5 w-3.5" />
            <span className="font-mono">{durationText}</span>
          </button>
        </div>
      ) : heroIsImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroUrl}
          alt={content.name}
          className={cn(
            "w-full object-cover",
            isDark ? "aspect-video" : "aspect-4/5 sm:aspect-video"
          )}
        />
      ) : (
        <div
          className={cn(
            "flex aspect-video w-full flex-col items-center justify-center gap-2",
            mediaConfig.accentBg
          )}
        >
          <p className={cn("text-sm", isDark ? "text-stone-400" : "text-stone-500")}>
            {t("content.previewMissing")}
          </p>
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
    <div className="space-y-1.5">
      <p className="text-sm font-bold tracking-wide text-stone-900">
        {t("content.captionPreview")}
      </p>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-stone-800">
        {caption}
      </p>
      {content.tags.length > 0 && (
        <p className="mt-2 text-base font-medium text-blue-600">
          {content.tags.map((tag) => `#${tag}`).join(" ")}
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
      <div className="min-h-full bg-white">
        {/* Edit sub-nav */}
        <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
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
    <div className="min-h-screen bg-white">
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title row */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-stone-400 uppercase">
            CONTENT DETAIL / #{content.contentId}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              {content.name}
            </h1>
            <span
              className={cn(
                "mt-1 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold",
                statusCfg.labelClass
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", statusCfg.dotClass)} />
              {statusText}
            </span>
          </div>
        </div>

        <div className="border-t border-stone-200" />

        {/* Vertical divider between columns */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_1px_320px]">
          {/* LEFT: media + caption + comments */}
          <div className="space-y-0 pr-0 lg:pr-10">
            <div className="pb-8">
              <HeroMediaPanel content={content} />
            </div>
            <div className="border-t border-stone-200 py-6">
              <CaptionPreview content={content} />
            </div>
            <div className="border-t border-stone-200 pt-6">
              <ContentComments contentId={content.id} />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block bg-stone-200" />

          {/* RIGHT: sidebar */}
          <aside className="space-y-0 pl-0 lg:pl-10">
            <div className="pb-6 pt-8">
              <AssignmentDetails content={content} />
            </div>

            <div className="border-t border-stone-200 py-6">
              <PostLinkSection
                content={content}
                canEdit={canEdit}
                onSaved={setContent}
              />
            </div>

            {content.details && (
              <div className="border-t border-stone-200 py-6">
                <PostObjective content={content} />
              </div>
            )}

            <div className="border-t border-stone-200 py-6">
              <ContentHistoryPanel contentId={content.id} variant="timeline" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
