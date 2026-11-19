import { Section } from "./section";

const steps = [
  {
    title: "Connect your wallet",
    description:
      "Users connect a Stellar wallet such as Freighter, Albedo, or Lobstr.",
  },
  {
    title: "Launch a campaign",
    description:
      "Creators launch a campaign stored in the backend with a contract reference.",
  },
  {
    title: "Donate with Stellar assets",
    description: "Donors contribute using XLM, USDC, or other Stellar-based assets.",
  },
  {
    title: "Soroban escrow",
    description: "The Soroban contract escrows the donated funds safely.",
  },
  {
    title: "Withdraw on-chain",
    description: "Creators withdraw funds securely and transparently on-chain.",
  },
  {
    title: "Admin verification",
    description:
      "Admin tools handle verification, fraud detection, and analytics.",
  },
];

export function HowItWorks() {
  return (
    <Section className="border-t border-foreground/10">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold">How StellarAid works</h2>
        <ol className="mt-8 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-sm font-medium text-foreground"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-foreground/80">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
