"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/shared/prisma";
import {
  getArchivePayload,
  getArchiveProduct,
} from "@/lib/archive/data/queries";
import type {
  ArchivePayload,
  ArchiveProductInput,
  ArchiveProductRecord,
  BrandAssetInput,
  BrandAssetKind,
  BrandAssetRecord,
  BrandHistoryRecord,
} from "@/lib/archive/types";
import { BRAND_ASSET_KINDS } from "@/lib/archive/types";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

function isAssetKind(value: string): value is BrandAssetKind {
  return BRAND_ASSET_KINDS.includes(value as BrandAssetKind);
}

export async function fetchArchive(): Promise<ActionResult<ArchivePayload>> {
  const user = await requireUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดูคลังข้อมูล" };
  }

  try {
    if (
      typeof prisma.brandHistory?.findUnique !== "function" ||
      typeof prisma.brandAsset?.findMany !== "function" ||
      typeof prisma.archiveProduct?.findMany !== "function"
    ) {
      return {
        success: false,
        error:
          "Prisma Client ยังไม่มีตารางคลังข้อมูล — รีสตาร์ท Docker เพื่อ generate และ migrate",
      };
    }

    return { success: true, data: await getArchivePayload() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[archive] fetch failed", error);
    if (/does not exist|P2021|P2010/i.test(message)) {
      return {
        success: false,
        error: "ฐานข้อมูลยังไม่มีตารางคลังข้อมูล กรุณารัน bunx prisma migrate deploy",
      };
    }
    return { success: false, error: `โหลดคลังข้อมูลไม่สำเร็จ — ${message}` };
  }
}

export async function saveBrandHistory(input: {
  title: string;
  body: string;
}): Promise<ActionResult<BrandHistoryRecord>> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }

  const record = await prisma.brandHistory.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      title: input.title.trim(),
      body: input.body.trim(),
    },
    update: {
      title: input.title.trim(),
      body: input.body.trim(),
    },
  });

  revalidatePath("/archive");
  return {
    success: true,
    data: {
      id: record.id,
      title: record.title,
      body: record.body,
      updatedAt: record.updatedAt.toISOString(),
    },
  };
}

export async function createBrandAsset(
  input: BrandAssetInput
): Promise<ActionResult<BrandAssetRecord>> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }
  if (!isAssetKind(input.kind)) {
    return { success: false, error: "ประเภทไฟล์แบรนด์ไม่ถูกต้อง" };
  }
  if (!input.name.trim()) {
    return { success: false, error: "กรุณากรอกชื่อ" };
  }

  const count = await prisma.brandAsset.count({ where: { kind: input.kind } });
  const record = await prisma.brandAsset.create({
    data: {
      kind: input.kind,
      name: input.name.trim(),
      url: input.url?.trim() ?? "",
      hex: input.hex?.trim() ?? "",
      fontFamily: input.fontFamily?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      sortOrder: count,
    },
  });

  revalidatePath("/archive");
  return {
    success: true,
    data: {
      id: record.id,
      kind: record.kind,
      name: record.name,
      url: record.url,
      hex: record.hex,
      fontFamily: record.fontFamily,
      notes: record.notes,
      sortOrder: record.sortOrder,
    },
  };
}

export async function updateBrandAsset(
  id: string,
  input: Omit<BrandAssetInput, "kind">
): Promise<ActionResult<BrandAssetRecord>> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }
  if (!input.name.trim()) {
    return { success: false, error: "กรุณากรอกชื่อ" };
  }

  const record = await prisma.brandAsset.update({
    where: { id },
    data: {
      name: input.name.trim(),
      url: input.url?.trim() ?? "",
      hex: input.hex?.trim() ?? "",
      fontFamily: input.fontFamily?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
    },
  });

  revalidatePath("/archive");
  return {
    success: true,
    data: {
      id: record.id,
      kind: record.kind,
      name: record.name,
      url: record.url,
      hex: record.hex,
      fontFamily: record.fontFamily,
      notes: record.notes,
      sortOrder: record.sortOrder,
    },
  };
}

export async function deleteBrandAsset(id: string): Promise<ActionResult> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.brandAsset.delete({ where: { id } });
  revalidatePath("/archive");
  return { success: true, data: undefined };
}

export async function fetchArchiveProduct(
  id: string
): Promise<ActionResult<ArchiveProductRecord | null>> {
  const user = await requireUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดูคลังข้อมูล" };
  }

  try {
    if (typeof prisma.archiveProduct?.findUnique !== "function") {
      return {
        success: false,
        error:
          "Prisma Client ยังไม่มีตารางคลังข้อมูล — รีสตาร์ท Docker เพื่อ generate และ migrate",
      };
    }

    return { success: true, data: await getArchiveProduct(id) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[archive] fetch product failed", error);
    return { success: false, error: `โหลดสินค้าไม่สำเร็จ — ${message}` };
  }
}

export async function createArchiveProduct(
  input: ArchiveProductInput
): Promise<ActionResult<ArchiveProductRecord>> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }
  if (!input.name.trim()) {
    return { success: false, error: "กรุณากรอกชื่อสินค้า" };
  }

  const count = await prisma.archiveProduct.count();
  const record = await prisma.archiveProduct.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      imageUrl: input.imageUrl?.trim() ?? "",
      sku: input.sku?.trim() ?? "",
      enabled: input.enabled ?? true,
      sortOrder: count,
    },
  });

  revalidatePath("/archive");
  return {
    success: true,
    data: {
      id: record.id,
      name: record.name,
      description: record.description,
      imageUrl: record.imageUrl,
      sku: record.sku,
      enabled: record.enabled,
      sortOrder: record.sortOrder,
    },
  };
}

export async function updateArchiveProduct(
  id: string,
  input: ArchiveProductInput
): Promise<ActionResult<ArchiveProductRecord>> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }
  if (!input.name.trim()) {
    return { success: false, error: "กรุณากรอกชื่อสินค้า" };
  }

  const record = await prisma.archiveProduct.update({
    where: { id },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      imageUrl: input.imageUrl?.trim() ?? "",
      sku: input.sku?.trim() ?? "",
      enabled: input.enabled ?? true,
    },
  });

  revalidatePath("/archive");
  return {
    success: true,
    data: {
      id: record.id,
      name: record.name,
      description: record.description,
      imageUrl: record.imageUrl,
      sku: record.sku,
      enabled: record.enabled,
      sortOrder: record.sortOrder,
    },
  };
}

export async function deleteArchiveProduct(id: string): Promise<ActionResult> {
  if (!(await requireUser())) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.archiveProduct.delete({ where: { id } });
  revalidatePath("/archive");
  return { success: true, data: undefined };
}
