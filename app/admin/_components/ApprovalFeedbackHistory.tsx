"use client";

import useSWR from "swr";
import { MessageSquare } from "lucide-react";
import {
  fetchContentComments,
  type ContentCommentItem,
} from "@/lib/notifications/actions/fetch";
import { formatThaiDateTime } from "@/lib/shared/utils";

function FeedbackEntry({ comment }: { comment: ContentCommentItem }) {
  return (
    <div className="border-l-2 border-stone-200 pl-4">
      <p className="text-xs text-stone-500">
        {formatThaiDateTime(comment.createdAt)}
      </p>
      <p className="mt-1 text-sm text-stone-800">
        <span className="font-semibold text-stone-900">
          {comment.authorName}:
        </span>{" "}
        {comment.body}
      </p>
    </div>
  );
}

export function ApprovalFeedbackHistory({ contentId }: { contentId: string }) {
  const { data: comments = [], isLoading } = useSWR<ContentCommentItem[]>(
    `content-comments:${contentId}`,
    () => fetchContentComments(contentId),
    { revalidateOnFocus: true }
  );

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-900">
        ประวัติการแสดงความคิดเห็น (Feedback History)
      </h3>

      {isLoading ? (
        <p className="text-sm text-stone-500">กำลังโหลด...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <FeedbackEntry key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-stone-200 px-4 py-6 text-sm text-stone-500">
          <MessageSquare className="h-4 w-4 shrink-0" />
          ยังไม่มีความคิดเห็นสำหรับ Content นี้
        </div>
      )}
    </section>
  );
}
