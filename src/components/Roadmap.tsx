import { Section } from "../app/components/section";
import { Card } from "./ui/Card";

type Phase = { title: string; summary: string; current?: boolean };

const phases: Phase[] = [
  {
    title: "Phase 1 (MVP)",
    summary:
      "Wallet login, campaign creation and approval, XLM/USDC donations, a basic dashboard and the core Soroban escrow contract.",
    current: true,
  },
  {
    title: "Phase 2",
    summary:
      "Email verification and KYC, advanced analytics, multi-asset campaigns, dispute handling and social login.",
  },
  {
    title: "Phase 3",
    summary:
      "Automated payout schedules, community governance, cross-border NGO support and trust badges.",
  },
  {
    title: "Phase 4",
    summary:
      "AI-driven fraud scoring, multi-chain campaign expansion and an ecosystem grant program.",
  },
];

export function Roadmap() {
  return (
    <Section className="border-t border-foreground/10">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold">Roadmap</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase) => (
            <li key={phase.title}>
              <Card
                className={phase.current ? "h-full border-foreground/40" : "h-full"}
                aria-current={phase.current ? "step" : undefined}
              >
                <h3 className="text-lg font-medium">{phase.title}</h3>
                {phase.current ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-foreground/70">
                    In progress
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-foreground/80">
                  {phase.summary}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
