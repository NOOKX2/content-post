"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteArchiveProduct } from "@/lib/archive/actions";
import type { ArchiveProductRecord } from "@/lib/archive/types";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { useT } from "@/lib/i18n";

export function ProductsPanel({
  products,
  onChange,
}: {
  products: ArchiveProductRecord[];
  onChange: (products: ArchiveProductRecord[]) => void;
}) {
  const { navigate } = useDashboardNav();
  const { t } = useT();

  const handleDelete = async (id: string) => {
    const result = await deleteArchiveProduct(id);
    if (!result.success) {
      return;
    }
    onChange(products.filter((product) => product.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            {t("archive.products")}
          </h2>
          <p className="text-sm text-stone-500">{t("archive.addProductHint")}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/archive/products/new")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
          aria-label={t("archive.addProduct")}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
          {t("archive.emptyProducts")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-40 w-full object-cover bg-stone-50"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-stone-50 text-xs text-stone-400">
                  {t("archive.noImage")}
                </div>
              )}
              <div className="space-y-1 p-3">
                <p className="text-sm font-semibold text-stone-900">
                  {product.name}
                </p>
                {product.sku && (
                  <p className="font-mono text-xs text-stone-500">{product.sku}</p>
                )}
                {product.description && (
                  <p className="line-clamp-3 text-xs text-stone-500">
                    {product.description}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/archive/products/${product.id}/edit`)
                    }
                  >
                    {t("common.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDelete(product.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
