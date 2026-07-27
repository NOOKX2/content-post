"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus } from "lucide-react";
import { ContentForm } from "@/components/content/content-form";
import { ContentWorkflowHub } from "@/components/content/content-workflow-hub";
import { ContentWorkflowStatusPanel } from "@/components/content/content-workflow-status-panel";
import { ContentWorkflowStepper } from "@/components/content/content-workflow-stepper";
import {
  getContentWorkflowHeader,
  getContentWorkflowStep,
  getCreateNewHref,
  getCreateResumeHref,
  parseCreateMediaType,
} from "@/lib/content/content-workflow";
import { useContents } from "@/lib/content/contents-provider";
import type { ContentItem, MediaType } from "@/lib/types";
import { Button } from "@/components/ui/button";

function isCreateHubPath(
  resumeId: string | null,
  newParam: string | null
): boolean {
  return !resumeId && newParam !== "1";
}

export function ContentWorkflowView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const newParam = searchParams.get("new");
  const typeParam = searchParams.get("type");
  const { data: session } = useSession();
  const { contents } = useContents();
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const isHubView = isCreateHubPath(resumeId, newParam);

  const userId = session?.user?.id;

  const myContents = useMemo(() => {
    return contents.filter((item) =>
      userId ? item.createdById === userId : true
    );
  }, [contents, userId]);

  useEffect(() => {
    if (isHubView) {
      setActiveContent(null);
      return;
    }

    if (newParam === "1") {
      setActiveContent(null);
      setMediaType(parseCreateMediaType(typeParam));
      return;
    }

    if (!resumeId) return;

    const match = contents.find((item) => item.id === resumeId);
    if (match) {
      setActiveContent(match);
      setMediaType(match.mediaType);
    }
  }, [resumeId, newParam, typeParam, contents, isHubView]);

  const handleMediaTypeChange = (type: MediaType) => {
    setMediaType(type);
    if (!activeContent && newParam === "1") {
      router.replace(getCreateNewHref(type));
    }
  };

  const setResumeContent = (item: ContentItem | null) => {
    if (item) {
      setActiveContent(item);
      router.replace(getCreateResumeHref(item.id));
      setMediaType(item.mediaType);
      return;
    }
    router.replace("/create");
  };

  const openCreateNew = () => {
    router.replace(getCreateNewHref("video"));
  };

  const step = activeContent ? getContentWorkflowStep(activeContent) : 1;
  const header = getContentWorkflowHeader(mediaType, step);
  const showStatusPanel =
    activeContent && (step === 2 || step === 4 || step === 5);
  const showWorkflowForm =
    !activeContent || step === 1 || step === 3;
  const workflowPhase =
    activeContent &&
    activeContent.mediaType === "video" &&
    step === 3
      ? "produce"
      : activeContent &&
          activeContent.mediaType === "video" &&
          step === 1
        ? "plan"
        : undefined;

  if (isHubView) {
    return (
      <ContentWorkflowHub
        contents={myContents}
        onCreateNew={openCreateNew}
        onSelectContent={setResumeContent}
      />
    );
  }

  if (showStatusPanel && activeContent) {
    return (
      <div className="space-y-6">
        <WorkflowBackBar onCreateNew={openCreateNew} />
        <ContentWorkflowStatusPanel
          content={activeContent}
          onContentChange={(item) => setResumeContent(item)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowBackBar onCreateNew={openCreateNew} />

      <ContentWorkflowStepper currentStep={step} />
      <div>
        <h2 className="text-xl font-bold text-stone-900">{header.title}</h2>
        <p className="mt-1 text-sm text-stone-500">{header.description}</p>
      </div>

      {showWorkflowForm && (
        <ContentForm
          key={activeContent?.id ?? `new-${mediaType}`}
          initialContent={
            activeContent && (step === 1 || step === 3) ? activeContent : undefined
          }
          initialMediaType={mediaType}
          workflowPhase={workflowPhase}
          onMediaTypeChange={handleMediaTypeChange}
          suppressSuccessScreen
          onSubmitted={(item) => setResumeContent(item)}
          onSaved={(item) => setResumeContent(item)}
        />
      )}
    </div>
  );
}

function WorkflowBackBar({
  onCreateNew,
}: {
  onCreateNew: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.replace("/create")}
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปภาพรวมงาน
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={onCreateNew}>
        <Plus className="h-4 w-4" />
        สร้าง Content ใหม่
      </Button>
    </div>
  );
}
