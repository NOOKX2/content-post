"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { fetchMyProfile } from "@/lib/profile/actions";
import type { UserProfile } from "@/lib/profile/types";

type ProfileContextValue = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setProfile(null);
      return;
    }

    let cancelled = false;
    void fetchMyProfile().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setProfile(result.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

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
