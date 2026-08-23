"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageSquare, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { TEAM_MEMBERS } from "@/lib/constants";
import { dateLocale, useT } from "@/lib/i18n";
import {
  fetchContentComments,
  postContentComment,
  type ContentCommentItem,
} from "@/lib/notifications/actions/fetch";
import { cn } from "@/lib/shared/utils";

type CommentType = "comment" | "edit_request" | "tag";

function commentTypeLabel(type: string, t: ReturnType<typeof useT>["t"]): string {
  switch (type) {
    case "edit_request":
      return t("content.editRequest");
    case "tag":
      return t("content.tag");
    default:
      return t("content.comment");
  }
}

function commentTypeClass(type: string) {
  switch (type) {
    case "edit_request":
      return "text-orange-500";
    case "tag":
      return "text-[#7C6BB5]";
    default:
      return "text-slate-400";
  }
}

function CommentTypeIcon({ type }: { type: string }) {
  const className = "h-3.5 w-3.5";
  switch (type) {
    case "edit_request":
      return <Pencil className={className} strokeWidth={2.25} />;
    case "tag":
      return <Tag className={className} strokeWidth={2.25} />;
    default:
      return <MessageSquare className={className} strokeWidth={2.25} />;
  }
}

function formatCommentTime(iso: string, locale: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const dayMonthYear = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dayMonthYear} · ${time}`;
}

export function ContentComments({
  contentId,
}: {
  contentId: string;
  theme?: "light" | "dark";
}) {
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const [body, setBody] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("comment");
  const [taggedName, setTaggedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: comments = [], mutate } = useSWR<ContentCommentItem[]>(
    `content-comments:${contentId}`,
    () => fetchContentComments(contentId),
    { revalidateOnFocus: true }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await postContentComment(contentId, {
        body: body.trim(),
        commentType,
        taggedName: commentType === "tag" ? taggedName : undefined,
      });
      setBody("");
      setCommentType("comment");
      setTaggedName("");
      setShowForm(false);
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("content.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const commentsTitleRaw = t("content.commentsTitle", { count: comments.length });
  const match = commentsTitleRaw.match(/^(.*)\s*\((\d+)\)\s*$/);
  const commentsTitle = match ? match[1].trim() : commentsTitleRaw;
  const commentsCount = match ? match[2] : String(comments.length);

  return (
    <section className="bg-transparent p-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare
            className="h-4 w-4 text-[#7C6BB5]"
            strokeWidth={2.25}
          />
          <h3 className="text-[15px] font-bold text-slate-900">
            {commentsTitle}
          </h3>
        </div>
        <span className="text-sm font-medium text-slate-400">{commentsCount}</span>
      </div>

      {comments.length > 0 ? (
        <ul className="space-y-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <PersonAvatar name={comment.authorName} size="sm" letters={1} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold text-slate-900">
                    {comment.authorName}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold",
                      commentTypeClass(comment.commentType)
                    )}
                  >
                    <CommentTypeIcon type={comment.commentType} />
                    {commentTypeLabel(comment.commentType, t)}
                  </span>
                  <span className="ml-auto text-xs text-slate-400">
                    {formatCommentTime(comment.createdAt, loc)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-800">
                  {comment.body}
                </p>
                {comment.taggedName ? (
                  <p className="mt-1 text-xs font-medium text-[#5B5EF0]">
                    {t("content.tagged", { name: comment.taggedName })}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            {t("content.emptyComments")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t("content.emptyCommentsHint")}
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-stone-200 pt-4">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-full items-center gap-2.5 text-left text-sm text-slate-400 transition hover:text-slate-600"
          >
            <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={2} />
            {t("content.writeComment")}
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["comment", t("content.commentAction")],
                  ["edit_request", t("content.editRequest")],
                  ["tag", t("content.tagAction")],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCommentType(type)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    commentType === type
                      ? "border-[#7C6BB5]/40 bg-[#F3F0FA] text-[#5B4B8A]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {commentType === "tag" ? (
              <select
                value={taggedName}
                onChange={(e) => setTaggedName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                required
              >
                <option value="">{t("content.taggedPlaceholder")}</option>
                {TEAM_MEMBERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : null}

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                commentType === "edit_request"
                  ? t("content.editRequestPlaceholder")
                  : commentType === "tag"
                    ? t("content.tagPlaceholder")
                    : t("content.commentPlaceholder")
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#7C6BB5]/50 focus:ring-2 focus:ring-[#7C6BB5]/15"
              autoFocus
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="min-w-24 px-5"
                disabled={submitting || !body.trim()}
              >
                {submitting ? t("common.submitting") : t("common.submit")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
