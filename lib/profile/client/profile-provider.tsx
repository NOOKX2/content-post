"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { UserProfile } from "@/lib/profile/types";

type ProfileContextValue = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  children,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialProfile?: UserProfile | null;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const value = useMemo(
    () => ({ profile, setProfile }),
    [profile]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
