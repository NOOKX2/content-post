"use client";

import Link from "next/link";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Bot, CheckCircle2, ExternalLink, XCircle } from "lucide-react";

export function ApprovalCardMessage({
  metadata,
}: {
  metadata: ApprovalCardMetadata;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isPending = metadata.status === "pending";

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-orange-100 bg-orange-50 px-3 py-2">
        <Bot className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-semibold text-orange-900">
          Approval Bot
        </span>
      </div>
      <div className="space-y-2 px-3 py-3 text-sm">
        <p className="font-semibold text-stone-900">คำขออนุมัติ Content</p>
        <div className="grid gap-1.5 text-xs text-stone-600">
          <Row label="ผู้ส่ง" value={metadata.requesterName} />
          <Row label="รหัส" value={metadata.contentCode} />
          <Row label="ชื่อ" value={metadata.contentName} />
          <Row label="ช่องที่ลง" value={metadata.channel} />
          <Row label="รายละเอียด" value={metadata.remarks} />
        </div>

        {!isPending && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium",
              metadata.status === "approved"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {metadata.status === "approved" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {metadata.status === "approved" ? "อนุมัติแล้ว" : "ส่งกลับแก้ไข"}
            {metadata.resolvedBy && ` โดย ${metadata.resolvedBy}`}
            {metadata.rejectReason && (
              <span className="block font-normal">
                เหตุผล: {metadata.rejectReason}
              </span>
            )}
          </div>
        )}

        {isPending && (
          <p className="text-xs text-stone-500">
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
              >
                ไปอนุมัติที่หน้า Admin
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              "รอ Admin อนุมัติที่หน้า Admin"
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-stone-400">{label}</span>
      <span className="min-w-0 text-stone-700">{value}</span>
    </div>
  );
}
