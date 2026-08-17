"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * ปุ่มล่างขวาของฟอร์มสร้างคอนเทนต์ — "เสร็จสิ้น" ส่งงานเข้าคิวแอดมิน
 * Logic การส่งทั้งแอดมิน + LINE อยู่ที่ app/create/_lib/submit-for-approval.ts
 */
export function FinishSubmitBar({
  isEdit,
  submitting,
  submitLabel,
  cancelLabel,
  clearLabel,
  onCancel,
  onClear,
}: {
  isEdit: boolean;
  submitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  clearLabel: string;
  onCancel?: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 pb-8">
      {isEdit ? (
        <Button type="button" variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
      ) : (
        <Button type="button" variant="secondary" onClick={onClear}>
          {clearLabel}
        </Button>
      )}
      <Button type="submit" size="lg" disabled={submitting}>
        <Send className="h-4 w-4" />
        {submitLabel}
      </Button>
    </div>
  );
}
