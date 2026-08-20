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
    <div className={cn("w-full border-b border-stone-200", className)}>
      <div className="grid grid-cols-4">
        {VIDEO_WORKFLOW_STEPS.map((step) => {
          const isComplete =
            step.id < displayStep || (isFullyDone && step.id === displayStep);
          const isCurrent = step.id === displayStep && !isFullyDone;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-1 border-b-2 px-2 py-3 text-center transition-colors",
                isCurrent
                  ? "border-teal-600 text-teal-700"
                  : isComplete
                    ? "border-transparent text-stone-700"
                    : "border-transparent text-stone-400"
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-xs font-medium text-stone-400">
                  {String(step.id).padStart(2, "0")}
                </span>
                {isComplete ? (
                  <Check className="h-3.5 w-3.5 text-teal-600" strokeWidth={3} />
                ) : null}
                <span>{step.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
