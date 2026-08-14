"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/shared/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/domain/password";
import { getMyProfile } from "@/lib/profile/data";
import {
  resolveDisplayName,
  type ProfileInput,
  type UserProfile,
} from "@/lib/profile/types";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function fetchMyProfile(): Promise<ActionResult<UserProfile>> {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: "กรุณาเข้าสู่ระบบ" };
  }

  const profile = await getMyProfile(userId);
  if (!profile) {
    return { success: false, error: "ไม่พบบัญชีผู้ใช้" };
  }

  return { success: true, data: profile };
}

export async function updateMyProfile(
  input: ProfileInput
): Promise<ActionResult<UserProfile>> {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: "กรุณาเข้าสู่ระบบ" };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const displayName = input.displayName.trim();
  const phone = input.phone.replace(/[^\d]/g, "");
  const phoneCountry = input.phoneCountry.trim() || "+66";
  const position = input.position.trim();
  const imageUrl = input.imageUrl.trim();
  const email = input.email.toLowerCase().trim();

  if (!firstName || !lastName) {
    return { success: false, error: "กรุณากรอกชื่อและนามสกุล" };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { success: false, error: "อีเมลไม่ถูกต้อง" };
  }

  const taken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (taken) {
    return { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
  }

  const name = resolveDisplayName({
    displayName,
    firstName,
    lastName,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      displayName: displayName || name,
      phone,
      phoneCountry,
      position,
      imageUrl,
      email,
      name,
    },
  });

  const profile = await getMyProfile(userId);
  if (!profile) {
    return { success: false, error: "ไม่พบบัญชีผู้ใช้" };
  }

  revalidatePath("/settings");
  return { success: true, data: profile };
}

export async function updateMyAvailability(
  busy: boolean
): Promise<ActionResult<UserProfile>> {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: "กรุณาเข้าสู่ระบบ" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { busy },
  });

  const profile = await getMyProfile(userId);
  if (!profile) {
    return { success: false, error: "ไม่พบบัญชีผู้ใช้" };
  }

  revalidatePath("/settings");
  return { success: true, data: profile };
}

export async function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: "กรุณาเข้าสู่ระบบ" };
  }

  if (input.newPassword.length < 8) {
    return { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) {
    return { success: false, error: "ไม่พบบัญชีผู้ใช้" };
  }

  const valid = await verifyPassword(input.currentPassword, user.password);
  if (!valid) {
    return { success: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(input.newPassword) },
  });

  return { success: true, data: undefined };
}
