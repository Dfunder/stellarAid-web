import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-1 flex-col bg-background text-foreground">
      <Container className="flex min-h-[70vh] items-center">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
          <div className="h-4 w-24 animate-pulse rounded bg-foreground/10" />
          <div className="h-12 w-full animate-pulse rounded bg-foreground/10" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-foreground/10" />
          <div className="h-10 w-40 animate-pulse rounded-full bg-foreground/10" />
        </div>
      </Container>

      <Container className="border-t border-foreground/10">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-40 animate-pulse rounded bg-foreground/10" />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 w-32 rounded bg-foreground/10" />
                <div className="mt-3 h-4 w-full rounded bg-foreground/10" />
                <div className="mt-2 h-4 w-3/4 rounded bg-foreground/10" />
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
