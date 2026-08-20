"use client";

import {
  Calendar,
  CalendarRange,
  Clapperboard,
  Eye,
  ExternalLink,
  Info,
  Package,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import { AttachmentLinks } from "@/app/create/_components/form/AttachmentLinks";
import { ImageAttachmentLinks } from "@/app/create/_components/form/ImageAttachmentLinks";
import {
  ContentFormSection,
  ContentFormSectionAction,
} from "@/app/create/_components/form/ContentFormSection";
import { PlatformSelect } from "@/app/create/_components/form/PlatformSelect";
import { ScriptTable } from "@/app/create/_components/form/ScriptTable";
import { TeamTable } from "@/app/create/_components/form/TeamTable";
import { CreatableMultiSelect } from "@/components/ui/CreatableMultiSelect";
import {
  FilmingEquipmentChecklist,
  getFilmingEquipmentTotalCount,
} from "@/app/create/_components/form/FilmingEquipmentChecklist";
import { Input } from "@/components/ui/Input";
import { PostingChannelSelect } from "@/app/create/_components/form/PostingChannelSelect";
import type { PostingChannelOption } from "@/app/create/_components/form/PostingChannelSelect";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  CONTENT_OBJECTIVES,
  LOCATIONS,
  PRODUCTS,
  TEAM_MEMBERS,
} from "@/lib/constants";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import { showFinalClipSection } from "@/lib/content/domain/workflow";
import { isImageMediaUrl, isVideoAttachmentUrl, isVideoMediaUrl } from "@/lib/content/domain/media-url";
import type { ContentFormData, ContentStatus, Platform } from "@/lib/types";
import { generateId } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

type ChannelOption = PostingChannelOption;

export function VideoContentFormFields({
  form,
  contentId,
  isEdit,
  contentStatus,
  workflowPhase,
  channelOptions,
  channelTargetSlugs,
  availablePlatforms,
  hidePlatformSelect = false,
  config,
  update,
  onChannelsChange,
}: {
  form: ContentFormData;
  contentId: string;
  isEdit: boolean;
  contentStatus?: ContentStatus;
  workflowPhase?: "plan" | "produce";
  channelOptions: ChannelOption[];
  channelTargetSlugs: string[];
  availablePlatforms: Platform[];
  hidePlatformSelect?: boolean;
  config: (typeof MEDIA_FORM_CONFIG)["video"];
  update: <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => void;
  onChannelsChange: (slugs: string[]) => void;
}) {
  const { t } = useT();
  const addTeamRow = () => {
    update("team", [
      ...form.team,
      { id: generateId(), participant: "", responsibility: "" },
    ]);
  };

  const addScriptRow = () => {
    update("script", [
      ...form.script,
      {
        id: generateId(),
        startTime: "",
        endTime: "",
        speaker: "",
        action: "",
        dialogue: "",
        notes: "",
        imageUrl: "",
      },
    ]);
  };

  const previewVideo =
    form.attachments.find((url) => url.trim() && isVideoAttachmentUrl(url)) ??
    "";
  const previewCover = form.coverImage.trim();
  const previewFallbackImage =
    form.exampleAttachments.find((url) => url.trim() && isImageMediaUrl(url)) ??
    form.script.find((row) => row.imageUrl?.trim())?.imageUrl ??
    "";
  const previewIsDirectVideo = Boolean(
    previewVideo && isVideoMediaUrl(previewVideo)
  );
  const previewImage =
    previewCover ||
    (previewFallbackImage && isImageMediaUrl(previewFallbackImage)
      ? previewFallbackImage
      : "");
  const isProducePhase = workflowPhase === "produce";
  const equipmentTotal = getFilmingEquipmentTotalCount();
  const equipmentSelected = form.filmingEquipment.filter((item) =>
    item.trim()
  ).length;
  const showClipUpload = isProducePhase
    ? true
    : workflowPhase === "plan"
      ? false
      : showFinalClipSection(isEdit, contentStatus);

  const briefSummary = (
    <ContentFormSection
      step="02"
      stepLabel="CONTENT"
      title={t("create.contentInfo")}
      icon={Info}
    >
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-stone-500">{t("create.contentName")}</p>
          <p className="font-semibold text-stone-900">{form.name || "—"}</p>
        </div>
        {form.details && (
          <div>
            <p className="text-xs text-stone-500">{t("create.details")}</p>
            <p className="whitespace-pre-wrap text-stone-700">{form.details}</p>
          </div>
        )}
        {form.category && (
          <div>
            <p className="text-xs text-stone-500">หมวดหมู่</p>
            <p className="text-stone-700">{form.category}</p>
          </div>
        )}
      </div>
    </ContentFormSection>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-8">
      {isProducePhase ? (
        <>
          {briefSummary}
          <ContentFormSection
            step="03"
            stepLabel="MEDIA"
            title={t("create.uploadEditedVideo")}
            description={t("create.videoFileHint")}
            icon={Video}
          >
            <AttachmentLinks
              links={form.attachments}
              onChange={(links) => update("attachments", links)}
              hideHeader
              hideToolbar
            />
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <p className="text-sm font-medium text-stone-800">
                {t("create.cover")}
              </p>
              <p className="text-xs text-stone-500">{t("create.coverHint")}</p>
              <ImageAttachmentLinks
                links={form.coverImage ? [form.coverImage] : []}
                onChange={(links) =>
                  update("coverImage", links.find((link) => link.trim()) ?? "")
                }
                hideHeader
                hideToolbar
                maxFiles={1}
                allowLinks={false}
                selectLabel={t("create.coverSelect")}
                emptyTitle={t("create.coverEmpty")}
                emptyHint="หรือลากรูปมาวางที่นี่"
              />
            </div>
          </ContentFormSection>
        </>
      ) : (
        <>
      <ContentFormSection
        step="02"
        stepLabel="CONTENT"
        title={t("create.contentInfo")}
        icon={Info}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            variant="flat"
            label={`${t("create.contentName")} *`}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="เช่น Hero Serum Launch Video"
            required
          />
          <Input
            variant="flat"
            label={t("create.contentCode")}
            value={contentId}
            readOnly
            placeholder={isEdit ? "" : t("create.autoCode")}
            className="font-mono"
          />
          <div>
            <PostingChannelSelect
              variant="flat"
              label={`${t("create.channel")} *`}
              options={channelOptions}
              placeholder={t("create.channelPlaceholder")}
              value={channelTargetSlugs}
              onChange={onChannelsChange}
              required={!isEdit}
              multiple={hidePlatformSelect}
              hint={
                hidePlatformSelect
                  ? "เลือกได้หลายช่อง — รายการดึงจาก Buffer"
                  : undefined
              }
            />
          </div>
          <Select
            variant="flat"
            label={t("create.purpose")}
            options={CONTENT_OBJECTIVES}
            placeholder={t("create.purposePlaceholder")}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </div>
        {!hidePlatformSelect && (
        <div className="mt-4">
          <PlatformSelect
            selected={form.platforms}
            availablePlatforms={availablePlatforms}
            disabled={channelTargetSlugs.length === 0}
            onChange={(platforms: Platform[]) => update("platforms", platforms)}
          />
        </div>
        )}
        <div className="mt-4">
          <Textarea
            variant="flat"
            label={t("create.details")}
            value={form.details}
            onChange={(e) => update("details", e.target.value)}
            placeholder={t("create.detailsPlaceholder")}
            rows={3}
          />
        </div>
      </ContentFormSection>

      <ContentFormSection
        step="03"
        stepLabel="REFERENCE"
        title="แนบรูป/คลิปวิดีโอตัวอย่าง (10 MB)"
      >
        <ImageAttachmentLinks
          links={form.exampleAttachments}
          onChange={(links) => update("exampleAttachments", links)}
          hideToolbar
        />
      </ContentFormSection>

      {showClipUpload && (
        <ContentFormSection
          step="03"
          stepLabel="MEDIA"
          title={t("create.finalClip")}
          description={t("create.finalClipHint")}
          icon={Video}
        >
          <AttachmentLinks
            links={form.attachments}
            onChange={(links) => update("attachments", links)}
            hideHeader
            hideToolbar
          />
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <p className="text-sm font-medium text-stone-800">
                {t("create.cover")}
              </p>
              <p className="text-xs text-stone-500">{t("create.coverHint")}</p>
            <ImageAttachmentLinks
              links={form.coverImage ? [form.coverImage] : []}
              onChange={(links) =>
                update("coverImage", links.find((link) => link.trim()) ?? "")
              }
              hideHeader
              hideToolbar
              maxFiles={1}
              allowLinks={false}
              selectLabel="เลือกปกคลิป"
              emptyTitle="คลิกเพื่อเลือกปกคลิปจากเครื่อง"
              emptyHint="หรือลากรูปมาวางที่นี่"
            />
          </div>
        </ContentFormSection>
      )}

      <ContentFormSection
        step="04"
        stepLabel="SHOOT DAY"
        title={t("create.shootDate")}
        icon={CalendarRange}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            variant="flat"
            label={t("create.shootDate")}
            type="date"
            value={form.shootDate}
            onChange={(e) => update("shootDate", e.target.value)}
          />
          <CreatableMultiSelect
            variant="flat"
            label="สถานที่"
            options={LOCATIONS}
            value={form.location}
            onChange={(locations) => update("location", locations)}
            optional={config.locationOptional}
            placeholder="ระบุสถานที่ถ่ายทำ"
            addPlaceholder="อื่นๆ..."
          />
        </div>
      </ContentFormSection>

      <ContentFormSection
        step="05"
        stepLabel="PEOPLE"
        title={t("create.participants")}
        icon={Users}
        actions={
          <ContentFormSectionAction onClick={addTeamRow}>
            + เพิ่มแถว
          </ContentFormSectionAction>
        }
      >
        <TeamTable
          rows={form.team}
          onChange={(rows) => update("team", rows)}
          hideAddButton
        />
      </ContentFormSection>

      <ContentFormSection step="06" stepLabel="PREP" title={t("create.prep")} icon={Package}>
        <div className="space-y-4">
          <CreatableMultiSelect
            label="สินค้า"
            options={PRODUCTS}
            value={form.productsNeeded}
            onChange={(items) => update("productsNeeded", items)}
            placeholder="เลือกสินค้า..."
            addPlaceholder="อื่นๆ..."
          />
          <Input
            variant="flat"
            label="อุปกรณ์ประกอบฉาก"
            value={form.itemsToPrepare}
            onChange={(e) => update("itemsToPrepare", e.target.value)}
            placeholder="อื่นๆ..."
          />
        </div>
      </ContentFormSection>

      <ContentFormSection
        step="07"
        stepLabel="EQUIPMENT"
        title="อุปกรณ์ถ่าย"
        meta={
          <span className="text-xs text-stone-400">
            {equipmentSelected}/{equipmentTotal} รายการ
          </span>
        }
      >
        <FilmingEquipmentChecklist
          value={form.filmingEquipment}
          onChange={(items) => update("filmingEquipment", items)}
        />
      </ContentFormSection>

      <ContentFormSection
        step="08"
        stepLabel="SCRIPT"
        title={t("create.script")}
        description={t("create.scriptHint")}
        icon={Clapperboard}
        actions={
          <ContentFormSectionAction onClick={addScriptRow}>
            เพิ่มซีน
          </ContentFormSectionAction>
        }
      >
        <ScriptTable
          rows={form.script}
          onChange={(rows) => update("script", rows)}
          hideAddButton
        />
      </ContentFormSection>

      <ContentFormSection step="09" stepLabel="TEAM" title={t("create.creators")} icon={UserRound}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            variant="flat"
            label={t("create.ideaPerson")}
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.ideaCreator}
            onChange={(e) => update("ideaCreator", e.target.value)}
          />
          <Select
            variant="flat"
            label={config.photographerLabel}
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.photographer}
            onChange={(e) => update("photographer", e.target.value)}
          />
          {config.showEditor && (
            <Select
              variant="flat"
              label={t("media.editor")}
              options={TEAM_MEMBERS}
              placeholder="เลือก..."
              value={form.editor}
              onChange={(e) => update("editor", e.target.value)}
            />
          )}
          <Input
            variant="flat"
            label={t("create.approver")}
            value=""
            readOnly
            placeholder={t("create.approverPlaceholder")}
          />
        </div>
      </ContentFormSection>
        </>
      )}
      </div>

      <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
        <ContentFormSection
          title={t("create.postDateTitle")}
          icon={Calendar}
          bodyClassName="space-y-3"
        >
          <Input
            variant="flat"
            label={t("create.postDate")}
            type="date"
            value={form.scheduledDate}
            onChange={(e) => update("scheduledDate", e.target.value)}
            required
          />
          <Input
            variant="flat"
            label={t("create.postTime")}
            type="time"
            value={form.scheduledTime}
            onChange={(e) => update("scheduledTime", e.target.value)}
            required
          />
          <p className="text-xs leading-relaxed text-stone-500">
            วันและเวลานี้จะใช้สำหรับลงโพสต์อัตโนมัติ และแสดงในปฏิทินคอนเทนต์
          </p>
        </ContentFormSection>

        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-stone-900">
            <Eye className="h-4 w-4 text-stone-500" />
            {t("create.preview")}
          </h3>
          <div className="overflow-hidden rounded-xl bg-stone-100">
            <div className="relative aspect-video w-full bg-stone-900">
              {previewIsDirectVideo ? (
                <video
                  src={previewVideo}
                  poster={previewCover || undefined}
                  controls
                  className="h-full w-full object-contain"
                  preload="metadata"
                />
              ) : previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImage}
                  alt={t("create.cover")}
                  className="h-full w-full object-contain"
                />
              ) : previewVideo ? (
                <a
                  href={previewVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-amber-100 hover:text-white"
                >
                  <ExternalLink className="h-8 w-8 text-amber-400" />
                  <span className="line-clamp-2 break-all">{previewVideo}</span>
                  <span className="text-xs text-amber-200/80">{t("create.openVideo")}</span>
                </a>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-stone-400">
                  <Video className="h-8 w-8 text-stone-500" />
                  <span>
                    {showClipUpload
                      ? t("create.noClip")
                      : t("create.noSample")}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t border-stone-200/80 bg-white p-3">
              <p className="text-sm font-bold leading-snug text-stone-900">
                {form.name.trim() || t("create.contentName")}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                {form.details.trim() || t("create.previewDetailsPlaceholder")}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-stone-400">
            {t("create.previewHint")}
          </p>
        </section>
      </aside>
    </div>
  );
}
