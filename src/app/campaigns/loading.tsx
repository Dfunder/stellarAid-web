import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Container className="py-16">
        <div className="h-8 w-40 animate-pulse rounded bg-foreground/10" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-foreground/10" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 w-32 rounded bg-foreground/10" />
              <div className="mt-3 h-4 w-full rounded bg-foreground/10" />
              <div className="mt-2 h-4 w-3/4 rounded bg-foreground/10" />
              <div className="mt-4 h-2 w-full rounded bg-foreground/10" />
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
