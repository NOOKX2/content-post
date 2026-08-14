"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { saveBrandHistory } from "@/lib/archive/actions";
import type { BrandHistoryRecord } from "@/lib/archive/types";
import { useT } from "@/lib/i18n";

export function HistoryPanel({
  history,
  onSaved,
}: {
  history: BrandHistoryRecord;
  onSaved: (next: BrandHistoryRecord) => void;
}) {
  const [title, setTitle] = useState(history.title);
  const [body, setBody] = useState(history.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const { t } = useT();

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const result = await saveBrandHistory({ title, body });
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSaved(result.data);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <Input
        label={t("archive.headingTitle")}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setSaved(false);
        }}
        placeholder={t("archive.headingPlaceholder")}
      />
      <Textarea
        label={t("archive.body")}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setSaved(false);
        }}
        rows={14}
        placeholder={t("archive.bodyPlaceholder")}
        className="min-h-[280px]"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? t("common.saving") : t("archive.saveHistory")}
        </Button>
        {saved && (
          <p className="text-sm text-emerald-700">{t("common.saved")}</p>
        )}
      </div>
    </div>
  );
}
