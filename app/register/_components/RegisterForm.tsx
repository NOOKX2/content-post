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
import { useT } from "@/lib/i18n";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useT();
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
      setError(t("auth.passwordMismatch"));
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
        setError(t("auth.registerThenLoginFailed"));
        return;
      }

      router.push("/create");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : { err };
      console.error("[register] unexpected error", { email, ...msg });
      setError(t("auth.serverError"));
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <AuthField
              label={t("auth.name")}
              value={name}
              onChange={setName}
              placeholder={t("auth.namePlaceholder")}
              required
              autoComplete="name"
              icon={<User className="h-4 w-4" />}
            />

            <AuthField
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
            />

            <AuthField
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t("auth.passwordMinHint")}
              required
              minLength={8}
              autoComplete="new-password"
              showPasswordToggle
            />

            <AuthField
              label={t("auth.confirmPassword")}
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
