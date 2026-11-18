import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function Section({ children, className = "" }: SectionProps) {
  return (
    <section className={cn("w-full px-6 py-16 sm:px-10", className)}>
      {children}
    </section>
  );
}
