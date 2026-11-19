import { siteConfig } from "@/config/site";
import { Section } from "./components/section";
import { Roadmap } from "../components/Roadmap";

const valueProps = [
  {
    title: "Decentralized & Secure",
    description:
      "Wallet-based, non-custodial flows keep fundraising transparent and in your control on Stellar.",
  },
  {
    title: "Multi-Asset Support",
    description:
      "Raise and receive contributions in XLM, USDC, and other Stellar-based assets.",
  },
  {
    title: "Transparent",
    description:
      "Every donation is verifiable on-chain, building trust for donors and creators.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section className="flex min-h-[70vh] items-center">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
          <p className="text-sm font-medium uppercase tracking-wide text-foreground/70">
            {siteConfig.name}
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            {siteConfig.tagline}
          </h1>
          <p className="max-w-2xl text-lg text-foreground/80">
            {siteConfig.description}
          </p>
          <a
            href="https://github.com/Dfunder/stellarAid-web#readme"
            className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Read the documentation
          </a>
        </div>
      </Section>

      <Section className="border-t border-foreground/10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold">Why StellarAid</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {valueProps.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6"
              >
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-foreground/80">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Roadmap />
    </main>
  );
}
