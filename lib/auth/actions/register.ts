"use server";

import { prisma } from "@/lib/shared/prisma";
import { hashPassword } from "@/lib/auth/domain/password";

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = input.email.toLowerCase().trim();
  const { password } = input;

  if (!name || !email || !password) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบ" };
  }

  if (password.length < 8) {
    return { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        displayName: name,
        email,
        password: passwordHash,
        role: "USER",
      },
    });

    return { success: true };
  } catch (err) {
    const safe =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { err };
    // Important: do not log password or password hash
    console.error("[registerUser] failed", { email, ...safe });
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}
