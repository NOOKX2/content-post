"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileImage, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  createArchiveProduct,
  updateArchiveProduct,
} from "@/lib/archive/actions";
import type { ArchiveProductRecord } from "@/lib/archive/types";
import { cn } from "@/lib/shared/utils";
import { uploadBrowserFile } from "@/lib/shared/storage/upload-browser";
import { useT } from "@/lib/i18n";

function FormStep({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product?: ArchiveProductRecord;
  onClose: () => void;
  onSaved: (product: ArchiveProductRecord) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [fileName, setFileName] = useState(
    product?.imageUrl ? (product.imageUrl.split("/").pop() ?? "") : ""
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { t } = useT();

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("archive.imageOnly"));
      return;
    }

    setUploading(true);
    setError("");
    setFileName(file.name);
    try {
      setImageUrl(await uploadBrowserFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("archive.uploadFailed"));
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { name, sku, description, imageUrl };
    const result = product
      ? await updateArchiveProduct(product.id, payload)
      : await createArchiveProduct(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSaved(result.data);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-stone-900">
          {product ? t("archive.editProductTitle") : t("archive.addProductTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("archive.closeForm")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-7">
        <FormStep step={1} title={t("archive.basicDetails")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t("archive.name")}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("archive.namePlaceholder")}
                />
                <Input
                  label={t("archive.sku")}
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder={t("archive.skuPlaceholder")}
                />
              </div>
            </FormStep>

            <FormStep step={2} title={t("archive.properties")}>
              <Textarea
                label={t("archive.description")}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                placeholder={t("archive.descriptionPlaceholder")}
              />
            </FormStep>

            <FormStep step={3} title={t("archive.uploadMedia")}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              const file = event.dataTransfer.files[0];
              if (file) void handleUpload(file);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition-colors",
              dragOver || uploading
                ? "border-blue-300 bg-blue-50/60"
                : "border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100/80"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            ) : (
              <Upload className="h-8 w-8 text-stone-400" />
            )}
            <p className="text-sm font-medium text-stone-700">
                {uploading
                    ? t("common.uploading")
                    : t("archive.dropzone")}
                </p>
                <p className="text-xs text-stone-400">{t("archive.imageTypes")}</p>
          </button>

          {(fileName || imageUrl) && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileImage className="h-5 w-5 text-stone-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">
                  {fileName || t("archive.productImage")}
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={cn(
                      "h-full rounded-full bg-blue-600 transition-all",
                      uploading ? "w-2/3 animate-pulse" : "w-full"
                    )}
                  />
                </div>
              </div>
              {uploading ? (
                <span className="text-xs text-stone-500">
                      {t("common.uploading")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("archive.fileDone")}
                </span>
              )}
            </div>
          )}
        </FormStep>
      </div>

      {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || uploading}
        >
          {saving ? t("common.saving") : t("archive.saveProduct")}
        </Button>
      </div>
    </div>
  );
}
