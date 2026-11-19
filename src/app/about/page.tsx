import { siteConfig } from "@/config/site";
import { Section } from "../components/section";

const repositories = [
  {
    name: "stellarAid-web",
    href: "https://github.com/Dfunder/stellarAid-web",
    description:
      "Frontend DApp (Next.js + Stellar SDK): wallet connection, campaign discovery and donation dashboard, creator dashboard and admin UI.",
  },
];

const plannedFolders = [
  { name: "/docs", description: "Technical documentation" },
  { name: "/examples", description: "Sample integrations" },
  { name: "/scripts", description: "Dev and deployment utilities" },
];

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">About {siteConfig.name}</h1>
          <p className="mt-4 text-foreground/80">
            {siteConfig.name} is an open-source, decentralized crowdfunding
            platform built on the Stellar Network and Soroban smart contracts.
            Creators raise funds in XLM or any Stellar-based asset, and donors
            get transparent, verifiable on-chain contributions.
          </p>
        </div>
      </Section>

      <Section className="border-t border-foreground/10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold">Repositories</h2>
          <ul className="mt-6 space-y-4">
            {repositories.map((repo) => (
              <li
                key={repo.name}
                className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6"
              >
                <a
                  href={repo.href}
                  rel="noreferrer"
                  className="text-lg font-medium underline"
                >
                  {repo.name}
                </a>
                <p className="mt-2 text-sm leading-6 text-foreground/80">
                  {repo.description}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-foreground/80">
            The project also includes:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
            {plannedFolders.map((folder) => (
              <li key={folder.name}>
                <code>{folder.name}</code> - {folder.description}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </main>
  );
}
