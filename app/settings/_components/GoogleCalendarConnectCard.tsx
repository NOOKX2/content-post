"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Link2, Loader2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  disconnectGoogleCalendarAction,
  fetchGoogleCalendarConnectionStatus,
} from "@/lib/integrations/google/actions";
import type { GoogleCalendarConnectionStatus } from "@/lib/integrations/google/connections";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

export function GoogleCalendarConnectCard() {
  const { t } = useT();
  const [status, setStatus] = useState<GoogleCalendarConnectionStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchGoogleCalendarConnectionStatus();
        if (!cancelled) setStatus(next);
      } catch {
        if (!cancelled) {
          setError(t("profile.googleCalendarLoadFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const result = params.get("googleCalendar");
    if (!result) return;
    if (result === "connected") {
      setMessage(t("profile.googleCalendarConnected"));
    } else if (result === "error") {
      setError(t("profile.googleCalendarConnectFailed"));
    }
    params.delete("googleCalendar");
    params.delete("reason");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
  }, [t]);

  const handleDisconnect = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await disconnectGoogleCalendarAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setStatus((current) =>
        current
          ? {
              ...current,
              connected: false,
              email: null,
              connectedAt: null,
            }
          : current
      );
      setMessage(t("profile.googleCalendarDisconnected"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-stone-500" />
            <h3 className="text-sm font-bold text-stone-900">
              {t("profile.googleCalendarTitle")}
            </h3>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {t("profile.googleCalendarHint")}
          </p>
        </div>

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
        ) : status?.connected ? (
          <div className="flex flex-col items-end gap-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {status.email}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void handleDisconnect()}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Unlink className="h-3.5 w-3.5" />
              )}
              {t("profile.googleCalendarDisconnect")}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={!status?.oauthConfigured || busy}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              window.location.href = "/api/google/calendar/connect";
            }}
          >
            <Link2 className="h-3.5 w-3.5" />
            {t("profile.googleCalendarConnect")}
          </Button>
        )}
      </div>

      {!loading && status && !status.oauthConfigured ? (
        <p className="mt-3 text-xs text-amber-700">
          {t("profile.googleCalendarNotConfigured")}
        </p>
      ) : null}

      {(error || message) && (
        <p
          className={cn(
            "mt-3 text-sm",
            error ? "text-red-600" : "text-emerald-700"
          )}
        >
          {error || message}
        </p>
      )}
    </section>
  );
}
