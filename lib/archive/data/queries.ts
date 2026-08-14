import { prisma } from "@/lib/shared/prisma";
import type {
  ArchivePayload,
  ArchiveProductRecord,
  BrandAssetKind,
  BrandAssetRecord,
  BrandHistoryRecord,
} from "@/lib/archive/types";

function toHistory(
  record: {
    id: string;
    title: string;
    body: string;
    updatedAt: Date;
  } | null
): BrandHistoryRecord {
  return {
    id: record?.id ?? "default",
    title: record?.title ?? "",
    body: record?.body ?? "",
    updatedAt: (record?.updatedAt ?? new Date()).toISOString(),
  };
}

function toAsset(record: {
  id: string;
  kind: BrandAssetKind;
  name: string;
  url: string;
  hex: string;
  fontFamily: string;
  notes: string;
  sortOrder: number;
}): BrandAssetRecord {
  return {
    id: record.id,
    kind: record.kind,
    name: record.name,
    url: record.url,
    hex: record.hex,
    fontFamily: record.fontFamily,
    notes: record.notes,
    sortOrder: record.sortOrder,
  };
}

export function toProduct(record: {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sku: string;
  enabled: boolean;
  sortOrder: number;
}): ArchiveProductRecord {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    imageUrl: record.imageUrl,
    sku: record.sku,
    enabled: record.enabled,
    sortOrder: record.sortOrder,
  };
}

export async function getArchivePayload(): Promise<ArchivePayload> {
  const [history, assets, products] = await Promise.all([
    prisma.brandHistory.findUnique({ where: { id: "default" } }),
    prisma.brandAsset.findMany({
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.archiveProduct.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return {
    history: toHistory(history),
    assets: assets.map((asset) => toAsset(asset)),
    products: products.map((product) => toProduct(product)),
  };
}

export async function getArchiveProduct(
  id: string
): Promise<ArchiveProductRecord | null> {
  const record = await prisma.archiveProduct.findUnique({ where: { id } });
  return record ? toProduct(record) : null;
}
