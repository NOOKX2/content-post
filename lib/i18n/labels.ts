import type { TFunction } from "./translate";

export function statusLabel(t: TFunction, status: string): string {
  return t(`status.${status}`);
}

export function taskStatusLabel(t: TFunction, status: string): string {
  return t(`taskStatus.${status}`);
}

export function workflowStepLabel(
  t: TFunction,
  step: 1 | 2 | 3 | 4 | 5,
  short = false
): string {
  if (step === 1) return t("workflow.plan");
  if (step === 2) return t("workflow.shoot");
  if (step === 3) return t("workflow.edit");
  if (step === 4) return t("workflow.complete");
  return t(short ? "workflow.publishedShort" : "workflow.published");
}

export function workflowStepHint(t: TFunction, step: 1 | 2 | 3 | 4 | 5): string {
  if (step === 1) return t("workflow.hintPlan");
  if (step === 2) return t("workflow.hintShoot");
  if (step === 3) return t("workflow.hintEdit");
  if (step === 4) return t("workflow.hintComplete");
  return t("workflow.hintPublished");
}
