export const BRAND_ASSET_KINDS = [
  "logo",
  "color",
  "font",
  "product_image",
  "graphic",
  "icon",
] as const;

export type BrandAssetKind = (typeof BRAND_ASSET_KINDS)[number];

export type BrandHistoryRecord = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type BrandAssetRecord = {
  id: string;
  kind: BrandAssetKind;
  name: string;
  url: string;
  hex: string;
  fontFamily: string;
  notes: string;
  sortOrder: number;
};

export type ArchiveProductRecord = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sku: string;
  enabled: boolean;
  sortOrder: number;
};

export type ArchivePayload = {
  history: BrandHistoryRecord;
  assets: BrandAssetRecord[];
  products: ArchiveProductRecord[];
};

export type BrandAssetInput = {
  kind: BrandAssetKind;
  name: string;
  url?: string;
  hex?: string;
  fontFamily?: string;
  notes?: string;
};

export type ArchiveProductInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  sku?: string;
  enabled?: boolean;
};

export const BRAND_KIND_LABELS: Record<BrandAssetKind, string> = {
  logo: "Logos",
  color: "Colors",
  font: "Fonts",
  product_image: "Photos",
  graphic: "Graphics",
  icon: "Icons",
};

export const BRAND_KIND_NAV: Array<{
  id: BrandAssetKind;
  label: string;
  hint: string;
}> = [
  { id: "logo", label: "Logos", hint: "โลโก้" },
  { id: "color", label: "Colors", hint: "สีแบรนด์" },
  { id: "font", label: "Fonts", hint: "ฟอนต์" },
  { id: "product_image", label: "Photos", hint: "รูปภาพสินค้า" },
  { id: "graphic", label: "Graphics", hint: "กราฟิก" },
  { id: "icon", label: "Icons", hint: "ไอคอน" },
];
