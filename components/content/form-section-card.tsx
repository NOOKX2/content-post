import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ContentFormSection } from "@/components/content/content-form-section";

/** @deprecated Use ContentFormSection */
export function FormSectionCard({
  title,
  description,
  actions,
  children,
  className,
  icon,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  icon?: LucideIcon;
}) {
  return (
    <ContentFormSection
      title={title}
      description={description}
      icon={icon}
      actions={actions}
      className={className}
    >
      {children}
    </ContentFormSection>
  );
}
