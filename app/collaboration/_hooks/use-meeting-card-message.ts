"use client";

import { useEffect, useState } from "react";
import type { MeetingCardMetadata } from "@/lib/collaboration/types";
import { useT } from "@/lib/i18n";

export function useMeetingCardMessage(metadata: MeetingCardMetadata) {
  const { t, locale } = useT();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return t("team.ended");
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return t("team.remainingH", { hours, minutes });
    return t("team.remainingM", { minutes, seconds });
  };

  const startsAt = new Date(metadata.startsAt).getTime();
  const endsAt = new Date(metadata.endsAt).getTime();
  const countdown =
    now < startsAt ? formatCountdown(startsAt - now)
    : now < endsAt ? t("team.inMeeting", { countdown: formatCountdown(endsAt - now) })
    : t("team.ended");

  return { countdown, t, locale };
}
