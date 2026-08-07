"use client";

import { Check } from "lucide-react";
import {
  VIDEO_WORKFLOW_STEPS,
  type VideoWorkflowStep,
} from "@/lib/content/domain/workflow";
import { cn } from "@/lib/shared/utils";

export function ContentWorkflowStepper({
  currentStep,
  fullyPublished = false,
  className,
}: {
  currentStep: VideoWorkflowStep;
  /** When true, the final step shows a checkmark — e.g. status is posted */
  fullyPublished?: boolean;
  className?: string;
}) {
  const displayStep = Math.min(currentStep, 4) as VideoWorkflowStep;
  const isFullyDone = fullyPublished || currentStep >= 5;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {VIDEO_WORKFLOW_STEPS.map((step, index) => {
          const isComplete =
            step.id < displayStep || (isFullyDone && step.id === displayStep);
          const isCurrent = step.id === displayStep && !isFullyDone;
          const isLast = index === VIDEO_WORKFLOW_STEPS.length - 1;

          return (
            <div
              key={step.id}
              className={cn("flex min-w-0 flex-1 items-start", !isLast && "flex-1")}
            >
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete &&
                      "border-blue-600 bg-blue-600 text-white",
                    isCurrent &&
                      "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100",
                    !isComplete &&
                      !isCurrent &&
                      "border-stone-200 bg-white text-stone-400"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "max-w-[4.5rem] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs",
                    isCurrent ? "text-blue-700" : "text-stone-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mt-4 h-0.5 min-w-2 flex-1 rounded-full sm:min-w-4",
                    step.id < displayStep ||
                      (isFullyDone && step.id === displayStep)
                      ? "bg-blue-600"
                      : "bg-stone-200"
                  )}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
