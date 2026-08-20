"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { getDefaultPathForRole } from "@/lib/auth/domain/routes";
import {
  AuthShell,
  AuthBrandPanel,
  AuthFormPanel,
} from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { loginSchema } from "@/lib/content/domain/form-schema";
import { useT } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const { t } = useT();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.invalidCredentials"));
        return;
      }

      const session = await getSession();
      router.push(getDefaultPathForRole(session?.user?.role));
      router.refresh();
    } catch {
      setError(t("auth.serverError"));
    }
  });

  return (
    <AuthShell
      brand={
        <AuthBrandPanel
          headline={
            <>
              {t("auth.loginHeadline1")}
              <br />
              {t("auth.loginHeadline2a")}{" "}
              <span className="text-blue-400">{t("auth.loginHeadline2b")}</span>
            </>
          }
          description={t("auth.loginDescription")}
        />
      }
      form={
        <AuthFormPanel
          title={t("auth.loginTitle")}
          subtitle={t("auth.loginSubtitle")}
          footer={
            <p className="text-center text-sm text-slate-500">
              {t("auth.noAccount")}{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t("auth.registerFree")}
              </Link>
            </p>
          }
        >
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <AuthField
              label={t("auth.email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              {...register("email")}
            />

            <AuthField
              label={t("auth.password")}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              showPasswordToggle
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm text-slate-600">{t("auth.remember")}</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("auth.loggingIn")}
                </>
              ) : (
                t("auth.logIn")
              )}
            </button>
          </form>
        </AuthFormPanel>
      }
    />
  );
}
