"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleCalendarConnectCard } from "@/app/settings/_components/GoogleCalendarConnectCard";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile/client/profile-provider";
import {
  changeMyPassword,
  updateMyProfile,
} from "@/lib/profile/actions";
import { PHONE_COUNTRIES, type UserProfile } from "@/lib/profile/types";
import {
  changePasswordSchema,
  profileFormSchema,
} from "@/lib/content/domain/form-schema";
import { uploadBrowserFile } from "@/lib/shared/storage/upload-browser";
import { cn } from "@/lib/shared/utils";

function formFromProfile(profile: UserProfile | null) {
  return {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    displayName: profile?.displayName ?? "",
    phone: profile?.phone ?? "",
    phoneCountry: profile?.phoneCountry || "+66",
    position: profile?.position ?? "",
    email: profile?.email ?? "",
    imageUrl: profile?.imageUrl ?? "",
  };
}

export function SettingsView() {
  const { data: session, update } = useSession();
  const { t } = useT();
  const { profile, setProfile } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: formFromProfile(profile),
  });
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const imageUrl = profileForm.watch("imageUrl");

  useEffect(() => {
    if (profile) {
      profileForm.reset(formFromProfile(profile));
      setError("");
    }
  }, [profile, profileForm]);

  function applyProfile(next: UserProfile) {
    setProfile(next);
    profileForm.reset(formFromProfile(next));
  }

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const url = await uploadBrowserFile(file);
      profileForm.setValue("imageUrl", url, { shouldDirty: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("archive.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    try {
      const result = await updateMyProfile(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      applyProfile(result.data);
      await update({
        user: {
          name: result.data.name,
          email: result.data.email,
          image: result.data.imageUrl || null,
          displayName: result.data.displayName,
          position: result.data.position,
          busy: result.data.busy,
        },
      });
      setMessage(t("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    try {
      const result = await changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      passwordForm.reset();
      setShowPassword(false);
      setMessage(t("profile.passwordChanged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  });

  return (
    <>
      <Header session={session} title={t("profile.page")} compact />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <h2 className="text-2xl font-bold text-stone-900">{t("profile.title")}</h2>

        <GoogleCalendarConnectCard />

        <form onSubmit={onSaveProfile} className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-700">
              {t("profile.photo")}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleUpload(file);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-28 w-28 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400 transition hover:border-amber-400 hover:text-stone-600"
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={t("profile.photo")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="h-7 w-7" />
                  <span className="mt-1 text-xs">
                    {uploading ? t("common.uploading") : t("profile.addImage")}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label={t("profile.firstName")}
              {...profileForm.register("firstName")}
            />
            <Input
              label={t("profile.lastName")}
              {...profileForm.register("lastName")}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">
                {t("profile.phone")}
              </label>
              <div className="flex gap-2">
                <select
                  {...profileForm.register("phoneCountry")}
                  className="h-10 w-30 shrink-0 rounded-lg border border-stone-200 bg-white px-2 text-sm"
                >
                  {PHONE_COUNTRIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.flag} {item.value}
                    </option>
                  ))}
                </select>
                <input
                  {...profileForm.register("phone", {
                    setValueAs: (value: string) => value.replace(/[^\d]/g, ""),
                  })}
                  inputMode="tel"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={t("profile.displayName")}
              hint={t("profile.displayNameHint")}
              {...profileForm.register("displayName")}
            />
            <Input
              label={t("profile.position")}
              placeholder={t("userMenu.accountOwner")}
              {...profileForm.register("position")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Input
              label={t("profile.email")}
              type="email"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register("email")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="mb-0.5 justify-self-end text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t("profile.changePassword")}
            </button>
          </div>

          {showPassword && (
            <div className="grid gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-3">
              <Input
                label={t("profile.currentPassword")}
                type="password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
              <Input
                label={t("profile.newPassword")}
                type="password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
              <div className="flex flex-col gap-1.5">
                <Input
                  label={t("profile.confirmPassword")}
                  type="password"
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  {...passwordForm.register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onChangePassword()}
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting
                    ? t("common.saving")
                    : t("profile.changePassword")}
                </Button>
              </div>
            </div>
          )}

          {(error || message) && (
            <p
              className={cn(
                "text-sm",
                error ? "text-red-600" : "text-emerald-700"
              )}
            >
              {error || message}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                profileForm.formState.isSubmitting || uploading || !profile
              }
              className="bg-orange-500 shadow-orange-500/20 hover:bg-orange-600"
            >
              {profileForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {profileForm.formState.isSubmitting
                ? t("common.saving")
                : t("profile.save")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
