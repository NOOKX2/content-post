"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { Send } from "lucide-react";
import { MediaTypeToggle } from "./media-type-toggle";
import { VideoContentFormFields } from "./video-content-form-fields";
import { ImageContentFormFields } from "./image-content-form-fields";
import { SubmitSuccess } from "./submit-success";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import type {
  ContentFormData,
  ContentItem,
  ImageMeta,
  MediaType,
  Platform,
} from "@/lib/types";
import { EMPTY_IMAGE_META } from "@/lib/types";
import { resolveNextContentIdFromList } from "@/lib/content/content-id";
import {
  createContent,
  previewNextContentId,
  resubmitIdeaForApproval,
  submitClipForApproval,
  updateContent,
} from "@/lib/content/actions";
import { contentItemToFormData } from "@/lib/content/mappers";
import {
  hasFinalVideoClip,
  shouldResubmitClip,
  shouldResubmitIdea,
} from "@/lib/content/content-workflow";
import { useContents } from "@/lib/content/contents-provider";
import { generateId } from "@/lib/utils";

type PostingChannelOption = {
  slug: string;
  label: string;
  prefix: string;
  platforms: Platform[];
};

const fetchPostingChannels = () =>
  fetch("/api/posting-channels").then((res) => res.json()) as Promise<{
    channels: PostingChannelOption[];
  }>;

const EMPTY_FORM: ContentFormData = {
  name: "",
  mediaType: "video",
  channel: "",
  platforms: [],
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
  const { contents, mutateContents } = useContents();
  const { data: postingData } = useSWR("posting-channels", fetchPostingChannels);

  const channelOptions =
    postingData?.channels.map((channel) => ({
      value: channel.slug,
      label: channel.label,
    })) ?? [];
  const selectedChannel = postingData?.channels.find(
    (channel) => channel.slug === form.channel
  );
  const availablePlatforms = selectedChannel?.platforms ?? [];

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
    async (channel: string, active: () => boolean) => {
      if (isEdit) return;

      if (!channel) {
        if (active()) setContentId("");
        return;
      }

      const channelPrefix = postingData?.channels.find(
        (item) => item.slug === channel
      )?.prefix;
      const localId = channelPrefix
        ? resolveNextContentIdFromList(channel, contents, channelPrefix)
        : null;
      if (localId && active()) {
        setContentId(localId);
      }

      const result = await previewNextContentId(channel);
      if (!active()) return;

      if (result.success) {
        setContentId(result.data);
      } else if (!localId) {
        setContentId("");
        console.error("[content-form] preview content id failed", result.error);
      }
    },
    [contents, isEdit, postingData?.channels]
  );

  const handleChannelChange = (channel: string) => {
    const nextChannel = postingData?.channels.find((item) => item.slug === channel);
    const nextAvailable = nextChannel?.platforms ?? [];
    setForm((prev) => ({
      ...prev,
      channel,
      platforms: prev.platforms.filter((p) => nextAvailable.includes(p)),
    }));
    if (isEdit) return;

    if (!channel || !nextChannel) {
      setContentId("");
      return;
    }

    const localId = resolveNextContentIdFromList(
      channel,
      contents,
      nextChannel.prefix
    );
    if (localId) {
      setContentId(localId);
    }
  };

  useEffect(() => {
    let active = true;
    void syncContentIdForChannel(form.channel, () => active);
    return () => {
      active = false;
    };
  }, [form.channel, syncContentIdForChannel]);

  const startNewContent = (mediaType: MediaType = "video") => {
    setSubmittedItem(null);
    setContentId("");
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
      return isVideo ? "ส่งขออนุมัติเบื้องต้น" : "ส่งเพื่ออนุมัติ";
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
    if (!isEdit && !form.channel.trim()) {
      alert("กรุณาเลือกช่องที่ลง");
      return;
    }
    if (!isEdit && form.platforms.length === 0) {
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
      {!isProducePhase && (
      <Card
        padding="none"
        className={isVideo ? "border-amber-100" : "border-pink-100"}
      >
        <div className="border-b border-stone-200 px-6 py-4">
          <h3 className="text-xl font-bold tracking-tight text-stone-900">
            {isVideo ? "Video Content" : "Picture Content"}
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {isVideo
              ? "รอบ 1: กรอก brief และแนบรูปตัวอย่าง — หลังอนุมัติแล้วค่อยอัปโหลดคลิปตัดต่อ"
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
          availablePlatforms={availablePlatforms}
          update={update}
          updateImageMeta={updateImageMeta}
          onChannelChange={handleChannelChange}
        />
      ) : (
        <VideoContentFormFields
          form={form}
          contentId={contentId}
          isEdit={isEdit}
          contentStatus={initialContent?.status}
          workflowPhase={workflowPhase}
          channelOptions={channelOptions}
          availablePlatforms={availablePlatforms}
          config={config}
          update={update}
          onChannelChange={handleChannelChange}
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
            onClick={() =>
              setForm({ ...EMPTY_FORM, mediaType: form.mediaType })
            }
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
