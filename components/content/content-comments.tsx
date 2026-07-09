"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageSquare, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/constants";
import {
  fetchContentComments,
  postContentComment,
  type ContentCommentItem,
} from "@/lib/notifications/fetch-actions";
import { cn, formatThaiDate } from "@/lib/utils";

type CommentType = "comment" | "edit_request" | "tag";

function commentTypeLabel(type: string): string {
  switch (type) {
    case "edit_request":
      return "ขอแก้ไข";
    case "tag":
      return "แท็ก";
    default:
      return "ความคิดเห็น";
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
  const [body, setBody] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("comment");
  const [taggedName, setTaggedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="apple-utility-card !p-5">
      <h3 className="apple-caption-strong mb-4 text-[#1d1d1f]">
        ความคิดเห็นและการทำงานร่วมกัน
      </h3>

      {comments.length > 0 ? (
        <ul className="mb-4 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-2 text-xs text-stone-500">
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
                  {commentTypeLabel(comment.commentType)}
                </span>
                <span className="font-medium text-stone-700">
                  {comment.authorName}
                </span>
                <span>·</span>
                <span>{formatThaiDate(comment.createdAt.slice(0, 10))}</span>
              </div>
              <p className="mt-1.5 text-sm text-stone-800">{comment.body}</p>
              {comment.taggedName && (
                <p className="mt-1 text-xs text-blue-600">
                  แท็ก: {comment.taggedName}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-stone-500">ยังไม่มีความคิดเห็น</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["comment", "แสดงความคิดเห็น"],
              ["edit_request", "ขอแก้ไข"],
              ["tag", "แท็กผู้รับผิดชอบ"],
            ] as const
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setCommentType(type)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
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
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            required
          >
            <option value="">เลือกผู้รับผิดชอบ</option>
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
              ? "ระบุสิ่งที่ต้องการแก้ไข..."
              : commentType === "tag"
                ? "ข้อความถึงผู้รับผิดชอบ..."
                : "แสดงความคิดเห็น..."
          }
          rows={3}
          className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
          {submitting ? "กำลังส่ง..." : "ส่ง"}
        </Button>
      </form>
    </section>
  );
}
