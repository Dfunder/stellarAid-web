import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "StellarAid — Empowering communities through technology",
};

const HeroPage = () => {
  return (
    <section className="w-full max-w-3xl mx-auto text-center relative overflow-hidden rounded-2xl">
      {/* Foreground content sits above the canvas */}
      <div className="relative z-10 py-20 px-6">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight mb-5 tracking-tight">
          Know that your donation
          <br />
          is making a difference
        </h1>

        {/* Sub-copy */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
          StellarAid uses blockchain transparency to prove every single project
          you fund, complete with verification and real-time impact tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-lg text-primary-foreground text-sm font-semibold shadow-sm transition-colors bg-primary hover:bg-primary/90"
          >
            Donate Now
          </Link>
          <Link
            href="/about"
            className="px-6 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            Learn More
          </Link>
        </div>

        {/* Stats Card — frosted glass so particles show through */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border py-7 px-6 flex flex-wrap justify-center gap-10 sm:gap-16">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-primary">$2.4M</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Donated
            </span>
          </div>
          <div className="hidden sm:block w-px bg-border self-stretch" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-secondary">
              12.5K
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Projects
            </span>
          </div>
          <div className="hidden sm:block w-px bg-border self-stretch" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-success">89K</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Donors
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPage;
