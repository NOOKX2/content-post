"use client";

import { useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Palette,
  Pencil,
  Plus,
  Shapes,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createBrandAsset,
  deleteBrandAsset,
  updateBrandAsset,
} from "@/lib/archive/actions";
import {
  BRAND_KIND_NAV,
  type BrandAssetKind,
  type BrandAssetRecord,
} from "@/lib/archive/types";
import { cn } from "@/lib/shared/utils";
import { uploadBrowserFile } from "@/lib/shared/storage/upload-browser";
import { useT } from "@/lib/i18n";
import { ColorEditor } from "./ColorEditor";

const IMAGE_KINDS = new Set<BrandAssetKind>([
  "logo",
  "product_image",
  "graphic",
  "icon",
]);

const KIND_ICONS = {
  logo: Sparkles,
  color: Palette,
  font: Type,
  product_image: ImageIcon,
  graphic: Shapes,
  icon: Sparkles,
} as const;

export function BrandPanel({
  assets,
  onChange,
}: {
  assets: BrandAssetRecord[];
  onChange: (assets: BrandAssetRecord[]) => void;
}) {
  const [kind, setKind] = useState<BrandAssetKind>("color");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BrandAssetRecord | null>(null);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#C4A574");
  const [fontFamily, setFontFamily] = useState("");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useT();
  const kindLabel = t(`archive.kindLabel.${kind}`);
  const kindHint = t(`archive.kindHint.${kind}`);

  const filtered = useMemo(
    () => assets.filter((asset) => asset.kind === kind),
    [assets, kind]
  );

  const resetEditor = () => {
    setAdding(false);
    setEditing(null);
    setName("");
    setHex("#C4A574");
    setFontFamily("");
    setNotes("");
    setUrl("");
    setError("");
  };

  const openAdd = () => {
    resetEditor();
    setAdding(true);
    if (IMAGE_KINDS.has(kind)) {
      fileRef.current?.click();
    }
  };

  const openEdit = (asset: BrandAssetRecord) => {
    setAdding(true);
    setEditing(asset);
    setName(asset.name);
    setHex(asset.hex || "#C4A574");
    setFontFamily(asset.fontFamily);
    setNotes(asset.notes);
    setUrl(asset.url);
    setError("");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadBrowserFile(file);
      setUrl(uploaded);
      if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, ""));
      setAdding(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("archive.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (kind === "color" && !/^#[0-9a-fA-F]{6}$/.test(hex.trim())) {
      setError(t("archive.invalidHex"));
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name: name.trim() || (kind === "color" ? hex : t("common.untitled")),
      url,
      hex: kind === "color" ? hex.trim().toUpperCase() : "",
      fontFamily: kind === "font" ? fontFamily : "",
      notes,
    };
    const result = editing
      ? await updateBrandAsset(editing.id, payload)
      : await createBrandAsset({ ...payload, kind });
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onChange(
      editing
        ? assets.map((asset) => (asset.id === editing.id ? result.data : asset))
        : [...assets, result.data]
    );
    resetEditor();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteBrandAsset(id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onChange(assets.filter((asset) => asset.id !== id));
    if (editing?.id === id) resetEditor();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="grid min-h-[32rem] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-stone-200 bg-stone-50/80 lg:border-b-0 lg:border-r">
          <div className="px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              {t("archive.brandKit")}
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {t("archive.ciBrand")}
            </p>
          </div>
          <nav className="space-y-0.5 px-2 pb-3">
            {BRAND_KIND_NAV.map((item) => {
              const Icon = KIND_ICONS[item.id];
              const active = kind === item.id;
              const count = assets.filter((asset) => asset.kind === item.id).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setKind(item.id);
                    resetEditor();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-[#f3ead8] font-medium text-stone-900"
                      : "text-stone-600 hover:bg-white hover:text-stone-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-amber-700" : "text-stone-400"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block leading-tight">
                      {t(`archive.kindLabel.${item.id}`)}
                    </span>
                    <span className="block text-[11px] font-normal text-stone-400">
                      {t(`archive.kindHint.${item.id}`)}
                    </span>
                  </span>
                  {count > 0 && (
                    <span className="text-[11px] text-stone-400">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">
                {kindLabel}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {kind === "color"
                  ? t("archive.kindDescription.color")
                  : kind === "font"
                    ? t("archive.kindDescription.font")
                    : t("archive.kindDescription.files", { hint: kindHint })}
              </p>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
              aria-label={t("archive.addKind", { name: kindLabel })}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />

          {kind === "color" && adding ? (
            <ColorEditor
              title={
                editing
                  ? t("archive.editItem")
                  : t("archive.addKind", { name: kindLabel })
              }
              name={name}
              hex={hex}
              saving={saving}
              error={error}
              nameLabel={t("archive.colorName")}
              namePlaceholder={t("archive.colorNamePlaceholder")}
              hexLabel={t("archive.hex")}
              pickLabel={t("archive.pickColor")}
              saveLabel={t("common.save")}
              cancelLabel={t("common.cancel")}
              deleteLabel={t("common.delete")}
              savingLabel={t("common.saving")}
              onNameChange={setName}
              onHexChange={setHex}
              onSave={() => void handleSave()}
              onCancel={resetEditor}
              onDelete={
                editing ? () => void handleDelete(editing.id) : undefined
              }
            />
          ) : kind === "color" ? (
            <div className="rounded-2xl border border-stone-200 p-5">
              <div className="mb-4 flex items-center gap-2">
                <p className="text-sm font-semibold text-stone-800">
                  {t("archive.palettes")}
                </p>
                <Pencil className="h-3.5 w-3.5 text-stone-300" />
              </div>
              <p className="mb-5 text-base font-medium text-stone-900">
                {t("archive.sampleBrand")}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-5">
                {filtered.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => openEdit(asset)}
                    className="group flex w-20 flex-col items-center gap-2"
                  >
                    <span
                      className="h-16 w-16 rounded-full border border-black/5 shadow-sm ring-offset-2 transition group-hover:ring-2 group-hover:ring-amber-400"
                      style={{ backgroundColor: asset.hex || "#e7e5e4" }}
                    />
                    <span className="line-clamp-2 text-center text-[11px] leading-tight text-stone-600">
                      {asset.name}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={openAdd}
                  className="flex w-20 flex-col items-center gap-2 text-stone-500 hover:text-stone-800"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#f97316,#eab308,#22c55e,#3b82f6,#a855f7,#f97316)] p-[3px]">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                      <Plus className="h-5 w-5" />
                    </span>
                  </span>
                  <span className="text-[11px]">{t("archive.addNew")}</span>
                </button>
              </div>
            </div>
          ) : kind === "font" ? (
            <div className="space-y-3">
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => openEdit(asset)}
                  className="w-full rounded-2xl border border-stone-200 px-5 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50/40"
                >
                  <p className="text-xs font-medium text-stone-500">{asset.name}</p>
                  <p
                    className="mt-1 truncate text-3xl text-stone-900"
                    style={{ fontFamily: asset.fontFamily || "inherit" }}
                  >
                    {t("archive.brandFontPreview")}
                  </p>
                  {asset.fontFamily && (
                    <p className="mt-1 font-mono text-[11px] text-stone-400">
                      {asset.fontFamily}
                    </p>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={openAdd}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 py-8 text-sm text-stone-500 hover:border-amber-400 hover:text-stone-800"
              >
                <Plus className="h-4 w-4" />
                {t("archive.addNewFont")}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => openEdit(asset)}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 text-left transition hover:border-amber-300"
                >
                  {asset.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-40 w-full object-contain bg-[linear-gradient(45deg,#f5f5f4_25%,transparent_25%,transparent_75%,#f5f5f4_75%),linear-gradient(45deg,#f5f5f4_25%,transparent_25%,transparent_75%,#f5f5f4_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-xs text-stone-400">
                      {t("common.noFile")}
                    </div>
                  )}
                  <div className="border-t border-stone-200 bg-white px-3 py-2">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {asset.name}
                    </p>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={openAdd}
                className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 text-sm text-stone-500 hover:border-amber-400 hover:text-stone-800"
              >
                <Plus className="h-6 w-6" />
                {t("archive.addNew")}
              </button>
            </div>
          )}

          {adding && kind !== "color" && (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="mb-3 text-sm font-semibold text-stone-800">
                {editing
                  ? t("archive.editItem")
                  : t("archive.addKind", { name: kindLabel })}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t("archive.itemName")}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("archive.itemNamePlaceholder")}
                />
                {kind === "font" && (
                  <Input
                    label={t("archive.fontCss")}
                    value={fontFamily}
                    onChange={(event) => setFontFamily(event.target.value)}
                    placeholder="Sarabun, sans-serif"
                  />
                )}
                {IMAGE_KINDS.has(kind) && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      {t("archive.file")}
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploading ? t("common.uploading") : t("common.chooseFile")}
                      </Button>
                      {url && (
                        <span className="truncate text-xs text-stone-500">
                          {t("common.uploaded")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={() => void handleSave()} disabled={saving}>
                  {saving ? t("common.saving") : t("common.save")}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDelete(editing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("common.delete")}
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={resetEditor}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
