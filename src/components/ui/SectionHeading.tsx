import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type SectionHeadingProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  as: Tag = "h2",
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="flex flex-col gap-1">
        <Tag className="text-2xl font-semibold">{title}</Tag>
        {description && (
          <p className="text-sm text-foreground/70">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
