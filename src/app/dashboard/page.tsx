import { Section } from "../components/section";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section>
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold">Creator dashboard</h1>
          <p className="mt-3 text-foreground/80">
            Manage the campaigns you have launched on StellarAid.
          </p>
          <div className="mt-8 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
            <h2 className="text-lg font-medium">No campaigns yet</h2>
            <p className="mt-3 text-sm leading-6 text-foreground/80">
              Connect your Stellar wallet to see your campaigns. Campaigns you
              create will appear here.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
