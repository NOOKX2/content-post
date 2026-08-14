"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Tabs } from "@/components/ui/Tabs";
import { useArchive } from "@/lib/archive/client/archive-provider";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { HistoryPanel } from "./HistoryPanel";
import { BrandPanel } from "./BrandPanel";
import { ProductsPanel } from "./ProductsPanel";
import { useT } from "@/lib/i18n";

type ArchiveTab = "history" | "brand" | "products";

function readArchiveTab(): ArchiveTab {
  if (typeof window === "undefined") {
    return "history";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "brand" || tab === "products") {
    return tab;
  }

  return "history";
}

export function ArchiveView() {
  const { data: session } = useSession();
  const { t } = useT();
  const { navigate } = useDashboardNav();
  const { archive, setHistory, setAssets, setProducts, error } = useArchive();
  const [tab, setTab] = useState<ArchiveTab>(readArchiveTab);

  useEffect(() => {
    const syncTab = () => setTab(readArchiveTab());
    window.addEventListener("popstate", syncTab);
    return () => window.removeEventListener("popstate", syncTab);
  }, []);

  return (
    <>
      <Header session={session} title={t("archive.title")} compact />
      <div className="space-y-5 px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <Tabs
          tabs={[
            { id: "history", label: t("archive.history") },
            { id: "brand", label: t("archive.brand") },
            { id: "products", label: t("archive.products") },
          ]}
          activeTab={tab}
          onChange={(id) => {
            const next = id as ArchiveTab;
            setTab(next);
            navigate(next === "history" ? "/archive" : `/archive?tab=${next}`);
          }}
        />

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : tab === "history" ? (
          <HistoryPanel
            key={archive.history.updatedAt}
            history={archive.history}
            onSaved={setHistory}
          />
        ) : tab === "brand" ? (
          <div className="-mx-1 sm:mx-0">
            <BrandPanel assets={archive.assets} onChange={setAssets} />
          </div>
        ) : (
          <ProductsPanel
            products={archive.products}
            onChange={setProducts}
          />
        )}
      </div>
    </>
  );
}
