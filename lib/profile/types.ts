export type UserProfile = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  phoneCountry: string;
  position: string;
  imageUrl: string;
  busy: boolean;
  role: string;
  openTaskCount: number;
};

export type ProfileInput = {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  phoneCountry: string;
  position: string;
  imageUrl: string;
  email: string;
};

export const PHONE_COUNTRIES = [
  { value: "+66", flag: "🇹🇭", label: "TH" },
  { value: "+65", flag: "🇸🇬", label: "SG" },
  { value: "+84", flag: "🇻🇳", label: "VN" },
  { value: "+62", flag: "🇮🇩", label: "ID" },
  { value: "+60", flag: "🇲🇾", label: "MY" },
  { value: "+81", flag: "🇯🇵", label: "JP" },
  { value: "+82", flag: "🇰🇷", label: "KR" },
  { value: "+86", flag: "🇨🇳", label: "CN" },
  { value: "+1", flag: "🇺🇸", label: "US" },
  { value: "+44", flag: "🇬🇧", label: "UK" },
] as const;

export function resolveDisplayName(profile: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
}): string {
  const display = profile.displayName?.trim();
  if (display) return display;
  const combined = [profile.firstName, profile.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (combined) return combined;
  return profile.name?.trim() || "";
}
