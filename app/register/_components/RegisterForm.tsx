"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, Loader2 } from "lucide-react";
import { registerUser } from "@/lib/auth/actions";
import {
  AuthShell,
  AuthBrandPanel,
  AuthFormPanel,
} from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({ name, email, password });

      if (!result.success) {
        console.warn("[register] registerUser returned error", {
          email,
          error: result.error,
        });
        setError(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("[register] signIn failed", {
          email,
          signInError: signInResult.error,
        });
        setError("สมัครสำเร็จแล้ว แต่เข้าสู่ระบบไม่ได้ กรุณา login ด้วยตนเอง");
        return;
      }

      router.push("/create");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : { err };
      console.error("[register] unexpected error", { email, ...msg });
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      brand={
        <AuthBrandPanel
          tag="PLAN · CREATE · PUBLISH"
          headline={
            <>
              Start Your
              <br />
              <span className="text-blue-400">Content</span> Journey.
            </>
          }
          description="เข้าร่วมทีม content creator — ส่งไอเดีย รออนุมัติ และขึ้นปฏิทินโพสต์อัตโนมัติ"
        />
      }
      form={
        <AuthFormPanel
          title="Create account"
          subtitle="กรอกข้อมูลเพื่อเริ่มใช้งาน"
          footer={
            <p className="text-center text-sm text-slate-500">
              มีบัญชีแล้ว?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <AuthField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="ชื่อของคุณ"
              required
              autoComplete="name"
              icon={<User className="h-4 w-4" />}
            />

            <AuthField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
            />

            <AuthField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              required
              minLength={8}
              autoComplete="new-password"
              showPasswordToggle
            />

            <AuthField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              showPasswordToggle
            />

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังสมัคร...
                </>
              ) : (
                "Sign up free"
              )}
            </button>
          </form>
        </AuthFormPanel>
      }
    />
  );
}
