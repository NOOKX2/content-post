"use client";

import { BrandIcon } from "@/components/ui/BrandIcon";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { useT } from "@/lib/i18n";

interface AuthBrandPanelProps {
  headline: React.ReactNode;
  description: string;
  tag?: string;
}

function AuthBrandFooter() {
  const { t } = useT();
  return (
    <p className="text-xs text-slate-500">{t("nav.tagline")}</p>
  );
}

export function AuthBrandPanel({
  headline,
  description,
  tag = "IDEA · CREATE · POST",
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col justify-between overflow-hidden bg-slate-950 p-10 xl:p-14">
      {/* Background layers */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-slate-900/70" />
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

      {/* Logo */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm ring-1 ring-white/20">
          <BrandIcon size="sm" />
          <span className="text-sm font-semibold text-white tracking-wide">
            iDea Content
          </span>
        </div>
      </div>

      {/* Hero text */}
      <div className="relative z-10 max-w-lg">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-widest text-blue-200 backdrop-blur-sm ring-1 ring-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          {tag}
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
          {headline}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-slate-300/90">
          {description}
        </p>
      </div>

      <div className="relative z-10">
        <AuthBrandFooter />
      </div>
    </div>
  );
}

interface AuthFormPanelProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthFormPanel({
  title,
  subtitle,
  children,
  footer,
}: AuthFormPanelProps) {
  return (
    <div className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitch />
      </div>
      <div className="mx-auto w-full max-w-md">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <BrandIcon size="sm" />
          <span className="text-base font-bold text-slate-900">iDea Content</span>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        {children}

        <div className="mt-8">{footer}</div>
      </div>
    </div>
  );
}

export function AuthShell({
  brand,
  form,
}: {
  brand: React.ReactNode;
  form: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {brand}
      {form}
    </div>
  );
}
