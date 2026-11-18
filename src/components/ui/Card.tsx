import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-foreground/10 bg-foreground/5 p-6",
        className,
      )}
      {...props}
    />
  );
}
