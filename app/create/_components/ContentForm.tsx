"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { Send } from "lucide-react";
import { MediaTypeToggle } from "./MediaTypeToggle";
import type { PostingChannelOption as PostingChannelSelectOption } from "@/app/create/_components/PostingChannelSelect";
import {
  formatChannelLabelFromTargets,
  platformsFromPostingTargets,
} from "@/lib/integrations/buffer/posting-targets";
import { VideoContentFormFields } from "./VideoContentFormFields";
import { ImageContentFormFields } from "./ImageContentFormFields";
import { SubmitSuccess } from "./SubmitSuccess";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import type {
  ContentFormData,
  ContentItem,
  ImageMeta,
  MediaType,
  Platform,
} from "@/lib/types";
import { EMPTY_IMAGE_META } from "@/lib/types";
import { resolveNextContentIdFromList } from "@/lib/content/data/content-id";
import {
  createContent,
  previewNextContentId,
  resubmitIdeaForApproval,
  submitClipForApproval,
  updateContent,
} from "@/lib/content/actions";
import { contentItemToFormData } from "@/lib/content/data/mappers";
import {
  hasFinalVideoClip,
  shouldResubmitClip,
  shouldResubmitIdea,
} from "@/lib/content/domain/workflow";
import { useContents } from "@/lib/content/client/contents-provider";
import { generateId } from "@/lib/shared/utils";

type PostingChannelApiOption = {
  slug: string;
  label: string;
  prefix: string;
  platforms: Platform[];
  name: string;
};

const fetchPostingChannels = () =>
  fetch("/api/posting-channels").then((res) => res.json()) as Promise<{
    channels: PostingChannelApiOption[];
    source: "buffer" | "legacy";
    error?: string;
  }>;

function resolveChannelTargetSlugs(
  channels: PostingChannelApiOption[],
  content: Pick<ContentFormData, "channel" | "platforms" | "postingTargets">
): string[] {
  if (content.postingTargets.length > 0) {
    return content.postingTargets.map((target) => target.bufferChannelId);
  }

  const slug = resolveLegacyChannelTargetSlug(
    channels,
    content.channel,
    content.platforms
  );
  return slug ? [slug] : [];
}

function resolveLegacyChannelTargetSlug(
  channels: PostingChannelApiOption[],
  channel: string,
  platforms: Platform[]
): string {
  const bySlug = channels.find((item) => item.slug === channel);
  if (bySlug) return bySlug.slug;

  const platform = platforms[0];
  const byName = channels.find(
    (item) =>
      item.name === channel &&
      (!platform || item.platforms.includes(platform))
  );
  return byName?.slug ?? "";
}

const EMPTY_FORM: ContentFormData = {
  name: "",
  mediaType: "video",
  channel: "",
  platforms: [],
  postingTargets: [],
  details: "",
  location: [],
  scheduledDate: "",
  scheduledTime: "",
  endTime: "",
  ideaFinishedDate: "",
  shootDate: "",
  editFinishedDate: "",
  team: [{ id: generateId(), participant: "", responsibility: "" }],
  productsNeeded: [],
  itemsToPrepare: "",
  filmingEquipment: [],
  attachments: [],
  exampleAttachments: [],
  script: [],
  ideaCreator: "",
  photographer: "",
  editor: "",
  category: "",
  tags: [],
  imageMeta: { ...EMPTY_IMAGE_META },
};

interface ContentFormProps {
  onSubmitSuccess?: () => void;
  initialContent?: ContentItem;
  onCancel?: () => void;
  onSaved?: (item: ContentItem) => void;
  onSubmitted?: (item: ContentItem) => void;
  onMediaTypeChange?: (mediaType: MediaType) => void;
  suppressSuccessScreen?: boolean;
  workflowPhase?: "plan" | "produce";
  initialMediaType?: MediaType;
}

export function ContentForm({
  onSubmitSuccess,
  initialContent,
  onCancel,
  onSaved,
  onSubmitted,
  onMediaTypeChange,
  suppressSuccessScreen = false,
  workflowPhase,
  initialMediaType = "video",
}: ContentFormProps) {
  const isEdit = Boolean(initialContent);
  const [form, setForm] = useState<ContentFormData>(() =>
    initialContent
      ? contentItemToFormData(initialContent)
      : { ...EMPTY_FORM, mediaType: initialMediaType }
  );
  const [contentId, setContentId] = useState(
    () => initialContent?.contentId ?? ""
  );
  const [submittedItem, setSubmittedItem] = useState<ContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [channelTargetSlugs, setChannelTargetSlugs] = useState<string[]>(() =>
    initialContent
      ? initialContent.postingTargets.map((target) => target.bufferChannelId)
      : []
  );
  const { contents, mutateContents } = useContents();
  const { data: postingData } = useSWR("posting-channels", fetchPostingChannels);

  const isBufferChannelMode = postingData?.source === "buffer";

  const channelOptions: PostingChannelSelectOption[] =
    (postingData?.channels ?? []).map((channel) => ({
      value: channel.slug,
      label: isBufferChannelMode ? channel.name : channel.label,
      platform: channel.platforms[0],
    }));
  const selectedChannels =
    postingData?.channels.filter((channel) =>
      channelTargetSlugs.includes(channel.slug)
    ) ?? [];
  const availablePlatforms = isBufferChannelMode
    ? platformsFromPostingTargets(form.postingTargets)
    : (selectedChannels[0]?.platforms ?? []);

  const config = MEDIA_FORM_CONFIG[form.mediaType];
  const isVideo = form.mediaType === "video";

  const update = <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateImageMeta = <K extends keyof ImageMeta>(
    key: K,
    value: ImageMeta[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      imageMeta: { ...prev.imageMeta, [key]: value },
    }));
  };

  const handleMediaTypeChange = (mediaType: MediaType) => {
    setForm((prev) => ({
      ...prev,
      mediaType,
      script: mediaType === "image" ? [] : prev.script,
      imageMeta:
        mediaType === "image" ? prev.imageMeta : { ...EMPTY_IMAGE_META },
    }));
    onMediaTypeChange?.(mediaType);
  };

  const syncContentIdForChannel = useCallback(
    async (channel: string, platform: Platform | undefined, active: () => boolean) => {
      if (isEdit) return;

      if (!channel) {
        if (active()) setContentId("");
        return;
      }

      const channelPrefix = postingData?.channels.find(
        (item) => item.slug === channelTargetSlugs[0]
      )?.prefix;
      const localId = channelPrefix
        ? resolveNextContentIdFromList(channel, contents, channelPrefix)
        : null;
      if (localId && active()) {
        setContentId(localId);
      }

      const result = await previewNextContentId(channel, platform);
      if (!active()) return;

      if (result.success) {
        setContentId(result.data);
      } else if (!localId) {
        setContentId("");
        console.error("[content-form] preview content id failed", result.error);
      }
    },
    [channelTargetSlugs, contents, isEdit, postingData?.channels]
  );

  const handleChannelsChange = (slugs: string[]) => {
    const selected =
      postingData?.channels.filter((item) => slugs.includes(item.slug)) ?? [];

    if (isBufferChannelMode) {
      const postingTargets = selected.map((channel) => ({
        bufferChannelId: channel.slug,
        platform: channel.platforms[0],
        name: channel.name,
      }));

      setChannelTargetSlugs(slugs);
      setForm((prev) => ({
        ...prev,
        postingTargets,
        channel: formatChannelLabelFromTargets(postingTargets),
        platforms: platformsFromPostingTargets(postingTargets),
      }));

      if (isEdit) return;

      if (!postingTargets.length) {
        setContentId("");
        return;
      }

      const firstChannel = selected[0];
      if (!firstChannel) return;

      const localId = resolveNextContentIdFromList(
        firstChannel.name,
        contents,
        firstChannel.prefix
      );
      if (localId) {
        setContentId(localId);
      }
      return;
    }

    const slug = slugs[0] ?? "";
    const nextChannel = selected[0];
    const nextAvailable = nextChannel?.platforms ?? [];

    setChannelTargetSlugs(slug ? [slug] : []);
    setForm((prev) => ({
      ...prev,
      postingTargets: [],
      channel: slug,
      platforms: prev.platforms.filter((platform) =>
        nextAvailable.includes(platform)
      ),
    }));
    if (isEdit) return;

    if (!slug || !nextChannel) {
      setContentId("");
      return;
    }

    const localId = resolveNextContentIdFromList(
      slug,
      contents,
      nextChannel.prefix
    );
    if (localId) {
      setContentId(localId);
    }
  };

  useEffect(() => {
    if (!postingData?.channels.length) return;
    const slugs = resolveChannelTargetSlugs(postingData.channels, form);
    if (slugs.length > 0) {
      setChannelTargetSlugs(slugs);
    }
  }, [
    form.channel,
    form.platforms,
    form.postingTargets,
    postingData?.channels,
  ]);

  useEffect(() => {
    let active = true;
    void syncContentIdForChannel(
      form.channel,
      form.platforms[0],
      () => active
    );
    return () => {
      active = false;
    };
  }, [form.channel, form.platforms, syncContentIdForChannel]);

  const startNewContent = (mediaType: MediaType = "video") => {
    setSubmittedItem(null);
    setContentId("");
    setChannelTargetSlugs([]);
    setForm({ ...EMPTY_FORM, mediaType });
    onMediaTypeChange?.(mediaType);
  };

  const willSubmitClip =
    isEdit &&
    isVideo &&
    hasFinalVideoClip(form) &&
    (initialContent?.status === "idea_approved" ||
      (initialContent?.status === "rejected" && shouldResubmitClip(initialContent)));

  const willResubmitIdea =
    isEdit &&
    isVideo &&
    initialContent &&
    shouldResubmitIdea(initialContent) &&
    !hasFinalVideoClip(form);

  const submitLabel = (() => {
    if (submitting) {
      return isEdit ? "กำลังบันทึก..." : "กำลังส่ง...";
    }
    if (!isEdit) {
      return isVideo ? "เสร็จสิ้น" : "ส่งเพื่ออนุมัติ";
    }
    if (willSubmitClip) {
      return "ส่งงานให้ตรวจสอบ";
    }
    if (willResubmitIdea) {
      return "ส่งแนวคิดเพื่ออนุมัติ";
    }
    return "บันทึกการแก้ไข";
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    if (
      !isEdit &&
      !form.channel.trim() &&
      form.postingTargets.length === 0
    ) {
      alert("กรุณาเลือกช่องที่ลง");
      return;
    }
    if (
      !isEdit &&
      form.postingTargets.length === 0 &&
      form.platforms.length === 0
    ) {
      alert("กรุณาเลือกแพลตฟอร์มอย่างน้อย 1 แพลตฟอร์ม");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        endTime: "",
        attachments: form.attachments.filter((link) => link.trim()),
        exampleAttachments: form.exampleAttachments.filter((link) => link.trim()),
        script: isVideo ? form.script : [],
        imageMeta: isVideo ? { ...EMPTY_IMAGE_META } : form.imageMeta,
      };

      let result;
      if (isEdit) {
        if (willSubmitClip) {
          result = await submitClipForApproval(initialContent!.id, payload);
        } else if (willResubmitIdea) {
          result = await resubmitIdeaForApproval(initialContent!.id, payload);
        } else {
          result = await updateContent(initialContent!.id, payload);
        }
      } else {
        result = await createContent(payload);
      }

      if (!result.success) {
        console.error("[content-form] action failed", {
          isEdit,
          contentId,
          mediaType: form.mediaType,
          error: result.error,
        });
        alert(result.error);
        return;
      }

      await mutateContents(
        (current = []) => {
          if (isEdit) {
            return current.map((item) =>
              item.id === result.data.id ? result.data : item
            );
          }
          return [result.data, ...current];
        },
        { revalidate: true }
      );

      if (isEdit) {
        onSaved?.(result.data);
        if (suppressSuccessScreen) {
          onSubmitted?.(result.data);
        }
        return;
      }

      setSubmittedItem(result.data);
      if (suppressSuccessScreen) {
        onSubmitted?.(result.data);
        return;
      }
      onSubmitSuccess?.();
    } catch (error) {
      console.error("[content-form] submit crashed", {
        isEdit,
        contentId,
        mediaType: form.mediaType,
        error,
      });
      const message =
        error instanceof Error && error.message
          ? error.message
          : isEdit
            ? "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่"
            : "ส่ง Content ไม่สำเร็จ กรุณาลองใหม่";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedItem && !isEdit) {
    return (
      <SubmitSuccess
        content={submittedItem}
        onCreateAnother={() => startNewContent(submittedItem.mediaType)}
      />
    );
  }

  const isProducePhase = workflowPhase === "produce";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {postingData?.error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {postingData.error}
        </div>
      )}
      {!isProducePhase && (
      <Card
        padding="none"
        className={isVideo ? "border-amber-100" : "border-pink-100"}
      >
        <div className="border-b border-stone-200 px-6 py-4">
          <h3 className="text-xl font-bold tracking-tight text-stone-900">
            {isVideo ? "วิดีโอคอนเทนต์" : "รูปภาพคอนเทนต์"}
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {isVideo
              ? "รอบ 1 : กรอกข้อมูลและแนบรูปตัวอย่าง - หลังอนุมัติแล้ว ค่อยอัปโหลดคลิปเพื่อส่งให้ตัดต่อ"
              : "กรอก brief งานออกแบบภาพ"}
          </p>
        </div>
        <div className="p-6">
          <MediaTypeToggle
            value={form.mediaType}
            onChange={handleMediaTypeChange}
          />
        </div>
      </Card>
      )}

      {!isVideo ? (
        <ImageContentFormFields
          form={form}
          contentId={contentId}
          isEdit={isEdit}
          channelOptions={channelOptions}
          channelTargetSlugs={channelTargetSlugs}
          availablePlatforms={availablePlatforms}
          hidePlatformSelect={isBufferChannelMode}
          update={update}
          updateImageMeta={updateImageMeta}
          onChannelsChange={handleChannelsChange}
        />
      ) : (
        <VideoContentFormFields
          form={form}
          contentId={contentId}
          isEdit={isEdit}
          contentStatus={initialContent?.status}
          workflowPhase={workflowPhase}
          channelOptions={channelOptions}
          channelTargetSlugs={channelTargetSlugs}
          availablePlatforms={availablePlatforms}
          hidePlatformSelect={isBufferChannelMode}
          config={config}
          update={update}
          onChannelsChange={handleChannelsChange}
        />
      )}

      <div className="flex justify-end gap-3 pb-8">
        {isEdit ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            ยกเลิก
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setChannelTargetSlugs([]);
              setForm({ ...EMPTY_FORM, mediaType: form.mediaType });
            }}
          >
            ล้างฟอร์ม
          </Button>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          <Send className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
