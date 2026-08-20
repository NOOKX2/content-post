"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { registerSchema } from "@/lib/content/domain/form-schema";
import { useT } from "@/lib/i18n";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useT();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError("");
    try {
      const result = await registerUser({ name, email, password });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(t("auth.registerThenLoginFailed"));
        return;
      }

      router.push("/create");
      router.refresh();
    } catch {
      setError(t("auth.serverError"));
    }
  });

  return (
    <AuthShell
      brand={
        <AuthBrandPanel
          tag="PLAN · CREATE · PUBLISH"
          headline={
            <>
              {t("auth.registerHeadline1")}
              <br />
              <span className="text-blue-400">
                {t("auth.registerHeadlineAccent")}
              </span>{" "}
              {t("auth.registerHeadline2")}
            </>
          }
          description={t("auth.registerDescription")}
        />
      }
      form={
        <AuthFormPanel
          title={t("auth.registerTitle")}
          subtitle={t("auth.registerSubtitle")}
          footer={
            <p className="text-center text-sm text-slate-500">
              {t("auth.hasAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t("auth.signIn")}
              </Link>
            </p>
          }
        >
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <AuthField
              label={t("auth.name")}
              placeholder={t("auth.namePlaceholder")}
              autoComplete="name"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register("name")}
            />

            <AuthField
              label={t("auth.email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <AuthField
              label={t("auth.password")}
              type="password"
              placeholder={t("auth.passwordMinHint")}
              autoComplete="new-password"
              showPasswordToggle
              error={errors.password?.message}
              {...register("password")}
            />

            <AuthField
              label={t("auth.confirmPassword")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              showPasswordToggle
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("auth.creatingAccount")}
                </>
              ) : (
                t("auth.createAccount")
              )}
            </button>
          </form>
        </AuthFormPanel>
      }
    />
  );
}
