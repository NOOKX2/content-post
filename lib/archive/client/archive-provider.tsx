"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type {
  ArchivePayload,
  ArchiveProductRecord,
  BrandAssetRecord,
  BrandHistoryRecord,
} from "@/lib/archive/types";

const EMPTY_HISTORY: BrandHistoryRecord = {
  id: "default",
  title: "",
  body: "",
  updatedAt: new Date(0).toISOString(),
};

export const EMPTY_ARCHIVE: ArchivePayload = {
  history: EMPTY_HISTORY,
  assets: [],
  products: [],
};

type ArchiveContextValue = {
  archive: ArchivePayload;
  setHistory: (history: BrandHistoryRecord) => void;
  setAssets: (assets: BrandAssetRecord[]) => void;
  setProducts: (products: ArchiveProductRecord[]) => void;
  setArchive: (archive: ArchivePayload) => void;
  error: string;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export function ArchiveProvider({
  children,
  initialArchive = EMPTY_ARCHIVE,
  initialError = "",
}: {
  children: React.ReactNode;
  initialArchive?: ArchivePayload | null;
  initialError?: string;
}) {
  const [archive, setArchive] = useState<ArchivePayload>(
    initialArchive ?? EMPTY_ARCHIVE
  );
  const [error] = useState(initialError);

  const value = useMemo<ArchiveContextValue>(
    () => ({
      archive,
      setArchive,
      setHistory: (history) =>
        setArchive((current) => ({ ...current, history })),
      setAssets: (assets) => setArchive((current) => ({ ...current, assets })),
      setProducts: (products) =>
        setArchive((current) => ({ ...current, products })),
      error,
    }),
    [archive, error]
  );

  return (
    <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
  );
}

export function useArchive() {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error("useArchive must be used within ArchiveProvider");
  }
  return context;
}
