import { siteConfig } from "@/config/site";
import { Section } from "./components/section";

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
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans text-foreground">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-background sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
            To get started, edit the{" "}
            <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[0.9em]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-foreground/70">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:opacity-90 md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-foreground/20 px-5 transition-colors hover:bg-foreground/5 md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
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
    </main>
  );
}
