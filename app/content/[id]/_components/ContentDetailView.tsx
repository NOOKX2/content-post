"use client";

import { useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  Clapperboard,
  Copy,
  CalendarDays,
  ExternalLink,
  Eye,
  FileDown,
  FileText,
  Link2,
  MousePointerClick,
  Play,
  Pencil,
  Share2,
  Sparkles,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { ContentForm } from "@/app/create/_components/form/ContentForm";
import { ContentHistoryPanel } from "@/app/content/[id]/_components/ContentHistoryPanel";
import { ContentComments } from "@/app/content/[id]/_components/ContentComments";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/Button";
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
import { PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/shared/utils";
import { statusLabel, useT } from "@/lib/i18n";
import type { ContentItem, Platform } from "@/lib/types";
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
  theme?: "light" | "dark";
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
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
        <Link2 className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
        {t("content.postLinkLabel")}
      </p>
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={!canEdit}
          placeholder={t("content.postLinkPlaceholder")}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400",
            !canEdit && "cursor-default text-slate-500"
          )}
        />
        {url ? (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded p-1 text-slate-400 transition hover:text-slate-600"
            title={t("content.copyLink")}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        ) : null}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded p-1 text-slate-400 transition hover:text-slate-600"
            title={t("content.openLink")}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
        {canEdit && isDirty ? (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "..." : t("common.save")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PlatformPills({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {platforms.map((platform) => {
        const config = PLATFORMS.find((p) => p.id === platform);
        return (
          <span
            key={platform}
            className="inline-flex rounded-full bg-[#FCE7EF] px-2.5 py-0.5 text-xs font-semibold text-[#C2185B]"
          >
            {config?.label ?? platform}
          </span>
        );
      })}
    </div>
  );
}

// ─── Assignment details ───────────────────────────────────────────────────────

function AssignmentDetails({
  content,
}: {
  content: ContentItem;
  theme?: "light" | "dark";
}) {
  const { t } = useT();

  const mediaTypeLabel =
    content.mediaType === "video"
      ? t("dashboard.mediaVideo")
      : content.mediaType === "image"
        ? t("dashboard.mediaImage")
        : content.mediaType === "graphic"
          ? t("dashboard.mediaGraphic")
          : MEDIA_FORM_CONFIG[content.mediaType]?.label ?? content.mediaType;

  const responsible =
    content.editor?.trim() || content.ideaCreator?.trim() || null;

  const rows: Array<{
    key: string;
    label: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }> = [];

  if (content.scheduledDate) {
    rows.push({
      key: "date",
      label: t("content.postDate"),
      value: (
        <span className="text-sm font-semibold text-slate-800">
          {content.scheduledDate}
          {content.scheduledTime ? ` · ${content.scheduledTime}` : ""}
        </span>
      ),
      icon: CalendarDays,
    });
  }

  if (content.platforms.length > 0) {
    rows.push({
      key: "platforms",
      label: t("content.platforms"),
      value: <PlatformPills platforms={content.platforms} />,
      icon: Share2,
    });
  }

  if (content.approver) {
    rows.push({
      key: "approver",
      label: t("content.approvedBy"),
      value: (
        <span className="text-sm font-semibold text-slate-800">
          {content.approver}
        </span>
      ),
      icon: CheckCheck,
    });
  }

  if (responsible) {
    rows.push({
      key: "responsible",
      label: t("content.responsiblePerson"),
      value: (
        <span className="text-sm font-semibold text-slate-800">{responsible}</span>
      ),
      icon: Users,
    });
  }

  rows.push({
    key: "type",
    label: t("content.contentTypeLabel"),
    value: (
      <span className="text-sm font-semibold text-slate-800">{mediaTypeLabel}</span>
    ),
    icon: Clapperboard,
  });

  return (
    <div>
      <p className="mb-4 flex items-center gap-2 text-[15px] font-bold text-slate-900">
        <Sparkles className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
        {t("content.assignmentDetails")}
      </p>
      <dl className="space-y-3.5">
        {rows.map(({ key, label, value, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <dt className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-600">
              <Icon className="h-4 w-4 text-slate-500" strokeWidth={2} />
              {label}
            </dt>
            <dd className="min-w-0 text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Post objective / details ─────────────────────────────────────────────────

function PostObjective({
  content,
}: {
  content: ContentItem;
  theme?: "light" | "dark";
}) {
  const { t } = useT();
  if (!content.details) return null;
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
        <FileText className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
        {t("content.objectiveTitle")}
      </p>
      <p className="text-sm leading-relaxed text-slate-700">{content.details}</p>
    </div>
  );
}

// ─── Hero media + stats + caption ─────────────────────────────────────────────

function formatCompactMetric(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString("th-TH");
}

function MediaCaptionPanel({ content }: { content: ContentItem }) {
  const { t } = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const heroUrl = content.attachments.find((url) => url.trim()) ?? "";
  const heroIsVideo = heroUrl ? isVideoMediaUrl(heroUrl) : false;
  const heroIsImage = heroUrl ? isImageAttachment(heroUrl) : false;
  const showVideoBadge = heroIsVideo || content.mediaType === "video";

  const headline =
    content.imageMeta?.headline?.trim() || content.name.trim() || "";
  const captionBody =
    content.details.trim() ||
    content.script
      .map((row) => row.dialogue?.trim() || row.action?.trim() || "")
      .filter(Boolean)
      .join("\n") ||
    "";

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
      // ignore autoplay/play restrictions
    }
  };

  const metrics = [
    {
      key: "reach",
      label: t("content.metricReach"),
      value: formatCompactMetric(null),
      icon: Users,
      iconClass: "text-[#4F46E5]",
    },
    {
      key: "views",
      label: t("content.metricViews"),
      value: formatCompactMetric(null),
      icon: Eye,
      iconClass: "text-[#E11D8A]",
    },
    {
      key: "likes",
      label: t("content.metricLikes"),
      value: formatCompactMetric(null),
      icon: ThumbsUp,
      iconClass: "text-[#F59E0B]",
    },
    {
      key: "ctr",
      label: t("content.metricCtr"),
      value: "—",
      icon: MousePointerClick,
      iconClass: "text-[#22C55E]",
    },
  ] as const;

  return (
    <div className="overflow-hidden">
      <div className="relative">
        {heroIsVideo ? (
          <>
            <video
              ref={videoRef}
              src={heroUrl}
              poster={content.coverImage || undefined}
              controls={false}
              className="aspect-video w-full bg-black object-cover"
              preload="metadata"
            />
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {!isPlaying ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              ) : null}
            </button>
          </>
        ) : heroIsImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt={content.name}
            className="aspect-video w-full object-cover"
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

        {showVideoBadge ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <Play className="h-3 w-3 fill-[#EF4444] text-[#EF4444]" />
            {t("content.videoBadge")}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-4 divide-x divide-slate-100 border-y border-slate-100">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className="flex flex-col items-center gap-1 px-2 py-3.5 text-center"
            >
              <Icon className={cn("h-4 w-4", metric.iconClass)} strokeWidth={2.25} />
              <p className="text-sm font-bold text-slate-900 sm:text-base">
                {metric.value}
              </p>
              <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                {metric.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-5">
        <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
          <FileText className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
          {t("content.captionPreview")}
        </p>

        {headline ? (
          <p className="text-base font-bold text-slate-900">
            ✨ {headline} ✨
          </p>
        ) : null}

        {captionBody ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {captionBody}
          </p>
        ) : (
          <p className="text-sm text-slate-400">{t("content.previewMissing")}</p>
        )}

        {content.tags.length > 0 ? (
          <p className="text-sm font-medium text-slate-400">
            {content.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        ) : null}
      </div>
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
        <div className="grid lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
          {/* LEFT: media + caption + comments */}
          <div className="space-y-0 pr-0 lg:pr-10">
            <div className="pt-8 pb-8">
              <MediaCaptionPanel content={content} />
            </div>
            <div className="pb-8">
              <ContentComments contentId={content.id} />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block bg-stone-200" />

          {/* RIGHT: sidebar */}
          <aside className="pl-0 lg:pl-10">
            <div className="mt-8 space-y-0">
              <AssignmentDetails content={content} />

              <div className="my-5 border-t border-slate-100" />

              <PostLinkSection
                content={content}
                canEdit={canEdit}
                onSaved={setContent}
              />

              {content.details ? (
                <>
                  <div className="my-5 border-t border-slate-100" />
                  <PostObjective content={content} />
                </>
              ) : null}
            </div>

            <div className="mt-6 border-t border-stone-200 py-6">
              <ContentHistoryPanel contentId={content.id} variant="timeline" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
