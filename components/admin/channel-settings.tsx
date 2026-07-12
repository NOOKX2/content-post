"use client";

import { useState } from "react";
import useSWR from "swr";
import { AlertCircle, ExternalLink, Link2, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";

type AdminChannel = {
  id: string;
  slug: string;
  label: string;
  prefix: string;
  platforms: Platform[];
  links: Array<{
    id: string;
    platform: Platform;
    bufferChannelId: string;
    bufferChannelName: string;
    enabled: boolean;
  }>;
};

type BufferChannel = {
  id: string;
  name: string;
  service: string;
  isDisconnected: boolean;
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const text = await res.text();
  let json: { error?: string } = {};
  if (text) {
    try {
      json = JSON.parse(text) as { error?: string };
    } catch {
      throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง — ลอง restart app");
    }
  }
  if (!res.ok) {
    throw new Error(json.error ?? "โหลดข้อมูลไม่สำเร็จ");
  }
  return json as T;
}

function mapBufferServiceToPlatform(service: string): Platform | null {
  if (service === "instagram") return "instagram";
  if (service === "tiktok") return "tiktok";
  if (service === "facebook") return "facebook";
  if (service === "youtube") return "youtube";
  return null;
}

const postingChannelsFetcher = (url: string) =>
  fetcher<{ channels: AdminChannel[] }>(url);

const bufferChannelsFetcher = (url: string) =>
  fetcher<{
    configured: boolean;
    channels: BufferChannel[];
    error?: string;
  }>(url);

export function ChannelSettings() {
  const {
    data: channelData,
    mutate: mutateChannels,
    isLoading,
    error: channelError,
  } = useSWR<{ channels: AdminChannel[] }>(
    "/api/admin/posting-channels",
    postingChannelsFetcher
  );
  const { data: bufferData, mutate: mutateBuffer } = useSWR<{
    configured: boolean;
    channels: BufferChannel[];
    error?: string;
  }>("/api/admin/buffer-channels", bufferChannelsFetcher);

  const [label, setLabel] = useState("");
  const [prefix, setPrefix] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/posting-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, prefix }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "สร้างช่องไม่สำเร็จ");
      setLabel("");
      setPrefix("");
      setShowAddForm(false);
      setMessage("เพิ่มช่องแล้ว — เลือกบัญชี Buffer ในการ์ดช่องนั้น");
      await mutateChannels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "สร้างช่องไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChannel(channel: AdminChannel) {
    const confirmed = window.confirm(
      `ลบช่อง "${channel.label}" (${channel.prefix})?\n\nการเชื่อม Buffer ทั้งหมดของช่องนี้จะถูกลบ — Content ที่สร้างไว้แล้วจะไม่ถูกลบ`
    );
    if (!confirmed) return;

    setDeletingId(channel.id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/posting-channels/${channel.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ลบช่องไม่สำเร็จ");
      setMessage(`ลบช่อง ${channel.label} แล้ว`);
      await mutateChannels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ลบช่องไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLinkPlatform(
    channelId: string,
    platform: Platform,
    bufferChannelId: string,
    bufferChannelName: string
  ) {
    await fetch(`/api/admin/posting-channels/${channelId}/platforms`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        bufferChannelId: bufferChannelId || null,
        bufferChannelName,
      }),
    });
    await mutateChannels();
  }

  const bufferByPlatform = (platform: Platform) =>
    (bufferData?.channels ?? []).filter(
      (ch) => mapBufferServiceToPlatform(ch.service) === platform
    );

  const channels = channelData?.channels ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900">
        <p className="font-medium">ชื่อช่อง ≠ บัญชีโซเชียล</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-blue-800/90">
          <li>
            กด <strong>เพิ่มช่อง</strong> แล้วตั้งชื่อที่ Creator จะเห็นใน dropdown
          </li>
          <li>
            เลือกบัญชี Buffer จริงต่อแพลตฟอร์มในแต่ละการ์ด — เช่น
            Instagram → <code className="rounded bg-white/70 px-1">nook__th</code>,
            TikTok → <code className="rounded bg-white/70 px-1">nook_down</code>
          </li>
        </ol>
        <p className="mt-2 text-blue-800/90">
          Creator ไม่ต้องใส่ API Key — แค่เลือกช่อง + แพลตฟอร์มในฟอร์มสร้าง Content
        </p>
        <a
          href="https://publish.buffer.com"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
        >
          เชื่อมบัญชีโซเชียลใหม่ใน Buffer ก่อน
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {bufferData?.error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {bufferData.error}
        </div>
      )}

      {channelError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {channelError.message}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">รายการช่อง</h2>
          <p className="text-xs text-stone-500">
            เชื่อมบัญชี Buffer ต่อแพลตฟอร์มในแต่ละช่อง
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setMessage("");
              setShowAddForm(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มช่อง
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void mutateBuffer();
              void mutateChannels();
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            รีเฟรชจาก Buffer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-stone-500">กำลังโหลดช่อง...</p>
      ) : channels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
          <p className="text-sm text-stone-600">ยังไม่มีช่อง</p>
          <p className="mt-1 text-xs text-stone-500">
            กดปุ่ม <strong>เพิ่มช่อง</strong> ด้านบนเพื่อเริ่มต้น
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={() => {
              setMessage("");
              setShowAddForm(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มช่อง
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => {
            const linkedCount = channel.links.filter((l) => l.enabled).length;

            return (
              <div
                key={channel.id}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-stone-900">{channel.label}</h3>
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600">
                      {channel.prefix}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {linkedCount === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        <AlertCircle className="h-3 w-3" />
                        ยังไม่ได้เชื่อมบัญชี
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        <Link2 className="h-3 w-3" />
                        เชื่อมแล้ว {linkedCount} แพลตฟอร์ม
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={deletingId === channel.id}
                      onClick={() => void handleDeleteChannel(channel)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === channel.id ? "กำลังลบ..." : "ลบช่อง"}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {PLATFORMS.map((platform) => {
                    const linked = channel.links.find(
                      (link) => link.platform === platform.id && link.enabled
                    );
                    const options = bufferByPlatform(platform.id);

                    return (
                      <div
                        key={platform.id}
                        className="rounded-lg border border-stone-100 bg-stone-50/80 p-3"
                      >
                        <p className="mb-2 text-xs font-medium text-stone-600">
                          {platform.label}
                        </p>
                        <select
                          className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm"
                          value={linked?.bufferChannelId ?? ""}
                          onChange={(e) => {
                            const selected = options.find(
                              (opt) => opt.id === e.target.value
                            );
                            void handleLinkPlatform(
                              channel.id,
                              platform.id,
                              e.target.value,
                              selected?.name ?? ""
                            );
                          }}
                        >
                          <option value="">— เลือกบัญชี Buffer —</option>
                          {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                              {opt.isDisconnected ? " (ตัดการเชื่อม)" : ""}
                            </option>
                          ))}
                        </select>
                        {linked?.bufferChannelName && (
                          <p className="mt-1 text-[11px] text-stone-500">
                            โพสต์ไป: {linked.bufferChannelName}
                          </p>
                        )}
                        {options.length === 0 && (
                          <p className="mt-1 text-[11px] text-amber-700">
                            ไม่มีบัญชี {platform.label} ใน Buffer
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!saving) setShowAddForm(false);
            }}
          />
          <form
            onSubmit={handleCreateChannel}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">เพิ่มช่องใหม่</h3>
                <p className="mt-0.5 text-xs text-stone-500">
                  ระบบสร้าง slug ให้อัตโนมัติจากชื่อแสดง
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={saving}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <Input
                label="ชื่อแสดง"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="nook__th"
                required
                autoFocus
              />
              <Input
                label="Prefix รหัส"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="NKT"
                required
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setShowAddForm(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "กำลังบันทึก..." : "เพิ่มช่อง"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
