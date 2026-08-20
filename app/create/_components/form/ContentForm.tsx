"use client";

/**
 * ฟอร์มสร้าง/แก้ไขคอนเทนต์
 * ปุ่มเสร็จสิ้น → FinishSubmitBar + handleSubmit → app/create/_lib/submit-for-approval.ts
 */

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { MediaTypeToggle } from "./MediaTypeToggle";
import type { PostingChannelOption as PostingChannelSelectOption } from "@/app/create/_components/form/PostingChannelSelect";
import {
  formatChannelLabelFromTargets,
  platformsFromPostingTargets,
} from "@/lib/integrations/buffer/posting-targets";
import { VideoContentFormFields } from "./VideoContentFormFields";
import { ImageContentFormFields } from "./ImageContentFormFields";
import { SubmitSuccess } from "./SubmitSuccess";
import { FinishSubmitBar } from "./FinishSubmitBar";
import { Card } from "@/components/ui/Card";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import { isStillMedia } from "@/lib/content/domain/media-type";
import type {
  ContentFormData,
  ContentItem,
  ImageMeta,
  MediaType,
  Platform,
} from "@/lib/types";
import { EMPTY_IMAGE_META } from "@/lib/types";
import { previewNextContentId } from "@/lib/content/actions";
import {
  getFinishSubmitKind,
  submitCreateContentForm,
} from "@/app/create/_lib/submit-for-approval";
import { resolveNextContentIdFromList } from "@/lib/content/data/content-id";
import { contentItemToFormData } from "@/lib/content/data/mappers";
import { contentFormSchema } from "@/lib/content/domain/form-schema";
import { useContents } from "@/lib/content/client/contents-provider";
import { useT } from "@/lib/i18n";
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
  coverImage: "",
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
  const { t } = useT();
  const isEdit = Boolean(initialContent);
  const { watch, setValue, reset, handleSubmit: submitForm } = useForm({
    resolver: zodResolver(contentFormSchema),
    defaultValues: initialContent
      ? contentItemToFormData(initialContent)
      : { ...EMPTY_FORM, mediaType: initialMediaType },
  });
  const form = watch();
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
  const isStill = isStillMedia(form.mediaType);

  const update = <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => {
    setValue(key, value as never, { shouldDirty: true });
  };

  const updateImageMeta = <K extends keyof ImageMeta>(
    key: K,
    value: ImageMeta[K]
  ) => {
    setValue(
      "imageMeta",
      { ...form.imageMeta, [key]: value },
      { shouldDirty: true }
    );
  };

  const handleMediaTypeChange = (mediaType: MediaType) => {
    setValue("mediaType", mediaType, { shouldDirty: true });
    if (isStillMedia(mediaType)) {
      setValue("script", [], { shouldDirty: true });
    } else {
      setValue("imageMeta", { ...EMPTY_IMAGE_META }, { shouldDirty: true });
    }
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
      setValue("postingTargets", postingTargets, { shouldDirty: true });
      setValue("channel", formatChannelLabelFromTargets(postingTargets), {
        shouldDirty: true,
      });
      setValue("platforms", platformsFromPostingTargets(postingTargets), {
        shouldDirty: true,
      });

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
    setValue("postingTargets", [], { shouldDirty: true });
    setValue("channel", slug, { shouldDirty: true });
    setValue(
      "platforms",
      form.platforms.filter((platform) => nextAvailable.includes(platform)),
      { shouldDirty: true }
    );
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
    reset({ ...EMPTY_FORM, mediaType });
    onMediaTypeChange?.(mediaType);
  };

  const submitKind = getFinishSubmitKind(form, initialContent);
  const willSubmitClip = submitKind === "submit_clip";
  const willResubmitIdea = submitKind === "resubmit_idea";

  const submitLabel = (() => {
    if (submitting) {
      return isEdit ? t("common.saving") : t("common.submitting");
    }
    if (!isEdit) {
      return isVideo ? t("create.finish") : t("create.submitForApproval");
    }
    if (willSubmitClip) {
      return t("create.submitWork");
    }
    if (willResubmitIdea) {
      return t("create.submitIdea");
    }
    return t("create.saveEdits");
  })();

  const handleSubmit = submitForm(async (values) => {
    if (!values.name.trim() || submitting) return;
    if (
      !isEdit &&
      !values.channel.trim() &&
      values.postingTargets.length === 0
    ) {
      alert(t("create.pickChannel"));
      return;
    }
    if (
      !isEdit &&
      values.postingTargets.length === 0 &&
      values.platforms.length === 0
    ) {
      alert(t("create.pickPlatform"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitCreateContentForm({
        form: values,
        initialContent,
      });

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
            ? t("create.saveFailed")
            : t("create.submitFailed");
      alert(message);
    } finally {
      setSubmitting(false);
    }
  });

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
          className={
            isVideo
              ? "border-orange-100"
              : form.mediaType === "graphic"
                ? "border-pink-100"
                : "border-emerald-100"
          }
        >
          <div className="border-b border-stone-200 px-6 py-4">
            <h3 className="text-xl font-bold tracking-tight text-stone-900">
              {isVideo
                ? t("create.videoContent")
                : form.mediaType === "graphic"
                  ? t("create.graphicContent")
                  : t("create.imageContent")}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {isVideo
                ? t("create.videoRound1")
                : form.mediaType === "graphic"
                  ? t("create.graphicBrief")
                  : t("create.imageBrief")}
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

      {isStill ? (
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

      <FinishSubmitBar
        isEdit={isEdit}
        submitting={submitting}
        submitLabel={submitLabel}
        cancelLabel={t("common.cancel")}
        clearLabel={t("create.clearForm")}
        onCancel={onCancel}
        onClear={() => {
          setChannelTargetSlugs([]);
          reset({ ...EMPTY_FORM, mediaType: form.mediaType });
        }}
      />
    </form>
  );
}
