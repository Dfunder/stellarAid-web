import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("mx-auto w-full max-w-5xl px-6 py-16 sm:px-10", className)}
      {...props}
    />
  );
}
