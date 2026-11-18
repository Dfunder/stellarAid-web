import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function Section({ children, className = "" }: SectionProps) {
  return (
    <section className={`w-full px-6 py-16 sm:px-10 ${className}`.trim()}>
      {children}
    </section>
  );
}
