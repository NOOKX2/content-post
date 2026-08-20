"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { fetchArchive } from "@/lib/archive/actions";
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
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [archive, setArchive] = useState<ArchivePayload>(EMPTY_ARCHIVE);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setArchive(EMPTY_ARCHIVE);
      setError("");
      return;
    }

    let cancelled = false;
    void fetchArchive().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setArchive(result.data);
        setError("");
      } else {
        setError(result.error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

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
