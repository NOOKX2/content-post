"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { getDefaultPathForRole } from "@/lib/auth/routes";
import {
  AuthShell,
  AuthBrandPanel,
  AuthFormPanel,
} from "./auth-layout";
import { AuthField } from "./auth-field";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      const session = await getSession();
      router.push(getDefaultPathForRole(session?.user?.role));
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      brand={
        <AuthBrandPanel
          headline={
            <>
              Create Beyond
              <br />
              Your <span className="text-blue-400">Content.</span>
            </>
          }
          description="วางแผน สร้าง และโพสต์ content ข้ามทุกแพลตฟอร์ม — จากไอเดียสู่ปฏิทิน ในที่เดียว"
        />
      }
      form={
        <AuthFormPanel
          title="Welcome back!"
          subtitle="กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ"
          footer={
            <p className="text-center text-sm text-slate-500">
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                สมัครสมาชิกฟรี
              </Link>
            </p>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

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
              placeholder="••••••••"
              required
              autoComplete="current-password"
              showPasswordToggle
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm text-slate-600">Remember for 30 days</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </AuthFormPanel>
      }
    />
  );
}
