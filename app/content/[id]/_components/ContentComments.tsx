"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageSquare, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TEAM_MEMBERS } from "@/lib/constants";
import { formatLocalizedDate, useT } from "@/lib/i18n";
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

function CommentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "edit_request":
      return <Pencil className="h-3.5 w-3.5" />;
    case "tag":
      return <Tag className="h-3.5 w-3.5" />;
    default:
      return <MessageSquare className="h-3.5 w-3.5" />;
  }
}

export function ContentComments({ contentId }: { contentId: string }) {
  const { t, locale } = useT();
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

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <MessageSquare className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {t("content.commentsTitle", { count: comments.length })}
        </h3>
      </div>

      <div>
        {comments.length > 0 ? (
          <ul className="mb-4 space-y-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-xl border border-stone-100 bg-stone-50/70 px-3.5 py-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                      comment.commentType === "edit_request"
                        ? "bg-orange-100 text-orange-700"
                        : comment.commentType === "tag"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-stone-200 text-stone-700"
                    )}
                  >
                    <CommentTypeIcon type={comment.commentType} />
                    {commentTypeLabel(comment.commentType, t)}
                  </span>
                  <span className="font-medium text-stone-700">
                    {comment.authorName}
                  </span>
                  <span>·</span>
                  <span>{formatLocalizedDate(comment.createdAt.slice(0, 10), locale)}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-800">
                  {comment.body}
                </p>
                {comment.taggedName && (
                  <p className="mt-1 text-xs text-blue-600">
                    {t("content.tagged", { name: comment.taggedName })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mb-4 py-8 text-center">
            <p className="text-sm font-medium text-stone-600">
              {t("content.emptyComments")}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {t("content.emptyCommentsHint")}
            </p>
          </div>
        )}

        {!showForm ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("content.writeComment")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-stone-100 pt-4">
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
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {commentType === "tag" && (
              <select
                value={taggedName}
                onChange={(e) => setTaggedName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
                required
              >
                <option value="">{t("content.taggedPlaceholder")}</option>
                {TEAM_MEMBERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}

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
              className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

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
