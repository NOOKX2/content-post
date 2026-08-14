"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile/client/profile-provider";
import {
  changeMyPassword,
  updateMyProfile,
} from "@/lib/profile/actions";
import { PHONE_COUNTRIES, type UserProfile } from "@/lib/profile/types";
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
  const initial = formFromProfile(profile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    profile ? "" : t("profile.loadFailed")
  );
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [phone, setPhone] = useState(initial.phone);
  const [phoneCountry, setPhoneCountry] = useState(initial.phoneCountry);
  const [position, setPosition] = useState(initial.position);
  const [email, setEmail] = useState(initial.email);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function applyProfile(next: UserProfile) {
    setProfile(next);
    setFirstName(next.firstName);
    setLastName(next.lastName);
    setDisplayName(next.displayName);
    setPhone(next.phone);
    setPhoneCountry(next.phoneCountry || "+66");
    setPosition(next.position);
    setEmail(next.email);
    setImageUrl(next.imageUrl);
  }

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const url = await uploadBrowserFile(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("archive.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await updateMyProfile({
        firstName,
        lastName,
        displayName,
        phone,
        phoneCountry,
        position,
        imageUrl,
        email,
      });
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
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError(t("profile.passwordMismatch"));
      return;
    }
    setChangingPassword(true);
    setError("");
    setMessage("");
    try {
      const result = await changeMyPassword({
        currentPassword,
        newPassword,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setMessage(t("profile.passwordChanged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <Header session={session} title={t("profile.page")} compact />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <h2 className="text-2xl font-bold text-stone-900">{t("profile.title")}</h2>

        <div className="space-y-6">
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
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <Input
              label={t("profile.lastName")}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">
                {t("profile.phone")}
              </label>
              <div className="flex gap-2">
                <select
                  value={phoneCountry}
                  onChange={(event) => setPhoneCountry(event.target.value)}
                  className="h-10 w-30 shrink-0 rounded-lg border border-stone-200 bg-white px-2 text-sm"
                >
                  {PHONE_COUNTRIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.flag} {item.value}
                    </option>
                  ))}
                </select>
                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value.replace(/[^\d]/g, ""))
                  }
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
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <Input
              label={t("profile.position")}
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              placeholder={t("userMenu.accountOwner")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Input
              label={t("profile.email")}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <Input
                label={t("profile.newPassword")}
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <Input
                  label={t("profile.confirmPassword")}
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleChangePassword()}
                  disabled={changingPassword}
                >
                  {changingPassword
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
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || uploading || !profile}
              className="bg-orange-500 shadow-orange-500/20 hover:bg-orange-600"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? t("common.saving") : t("profile.save")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
