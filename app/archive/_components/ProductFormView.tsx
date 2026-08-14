"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useArchive } from "@/lib/archive/client/archive-provider";
import type { ArchiveProductRecord } from "@/lib/archive/types";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { ProductForm } from "./ProductForm";
import { useT } from "@/lib/i18n";

const PRODUCTS_HREF = "/archive?tab=products";

export function ProductFormView({ productId }: { productId: string | null }) {
  const { data: session } = useSession();
  const { t } = useT();
  const { navigate } = useDashboardNav();
  const { archive, setProducts } = useArchive();
  const product = useMemo(
    () =>
      productId
        ? (archive.products.find((item) => item.id === productId) ?? null)
        : null,
    [archive.products, productId]
  );
  const [error] = useState(
    productId && !product ? t("archive.productNotFound") : ""
  );

  const goBack = () => navigate(PRODUCTS_HREF);

  const handleSaved = (saved: ArchiveProductRecord) => {
    const exists = archive.products.some((item) => item.id === saved.id);
    setProducts(
      exists
        ? archive.products.map((item) =>
            item.id === saved.id ? saved : item
          )
        : [...archive.products, saved]
    );
    goBack();
  };

  return (
    <>
      <Header
        session={session}
        title={
          productId
            ? t("archive.editProductTitle")
            : t("archive.addProductTitle")
        }
        compact
      />
      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-4 sm:px-6 md:px-8 md:py-6">
        {error ? (
          <div className="space-y-3 rounded-xl border border-stone-200 bg-white px-4 py-8 text-center">
            <p className="text-sm text-stone-600">{error}</p>
            <Button type="button" variant="ghost" onClick={goBack}>
              {t("archive.backToProducts")}
            </Button>
          </div>
        ) : (
          <ProductForm
            key={product?.id ?? "new"}
            product={product ?? undefined}
            onClose={goBack}
            onSaved={handleSaved}
          />
        )}
      </div>
    </>
  );
}
