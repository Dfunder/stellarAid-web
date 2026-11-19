import { Section } from "../components/section";

const panels = [
  {
    title: "Moderation queue",
    description: "Campaigns awaiting approval and moderation will appear here.",
  },
  {
    title: "Analytics summary",
    description: "Platform analytics will appear here.",
  },
];

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section>
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold">Admin</h1>
          <p className="mt-3 text-foreground/80">
            Approvals and moderation. This is a placeholder shell: access
            control is not implemented yet and no data is shown.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {panels.map((panel) => (
              <article
                key={panel.title}
                className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6"
              >
                <h2 className="text-lg font-medium">{panel.title}</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/80">
                  {panel.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
