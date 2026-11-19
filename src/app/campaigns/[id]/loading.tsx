import { Section } from "@/components/ui/Section";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section className="py-12">
        <div className="h-8 w-64 animate-pulse rounded bg-foreground/10" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-foreground/10" />
        <div className="mt-8 flex flex-col gap-8 sm:flex-row">
          <div className="flex-1 animate-pulse rounded-2xl bg-foreground/5 p-6">
            <div className="h-4 w-full rounded bg-foreground/10" />
            <div className="mt-3 h-4 w-3/4 rounded bg-foreground/10" />
            <div className="mt-6 h-2 w-full rounded bg-foreground/10" />
          </div>
        </div>
      </Section>
    </main>
  );
}
