import { Section } from "@/components/ui/Section";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section className="py-12">
        <div className="h-8 w-64 animate-pulse rounded bg-foreground/10" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-foreground/10" />
        <div className="mt-8 flex flex-col gap-8 sm:flex-row">
          <div className="h-64 w-full animate-pulse rounded-2xl bg-foreground/10 sm:w-2/3" />
          <div className="flex-1 animate-pulse rounded-2xl bg-foreground/10 p-6" />
        </div>
      </Section>
    </main>
  );
}
