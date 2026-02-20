import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description: "StellarAid — Empowering communities through technology",
};

const features = [
  {
    icon: "⚡",
    badge: "Performance",
    badgeVariant: "badge-primary",
    title: "App Router Architecture",
    description:
      "Built on React Server Components for optimal performance and a seamless developer experience.",
  },
  {
    icon: "🎨",
    badge: "Design",
    badgeVariant: "badge-accent",
    title: "StellarAid Design System",
    description:
      "Custom Tailwind tokens — brand colors, Poppins font, spacing scale, and component utilities.",
  },
  {
    icon: "🌙",
    badge: "Accessibility",
    badgeVariant: "badge-success",
    title: "Dark Mode Ready",
    description:
      "Full dark mode support via CSS variables. Toggle persists across sessions with system preference fallback.",
  },
  {
    icon: "🔷",
    badge: "Type Safe",
    badgeVariant: "badge-warning",
    title: "TypeScript Strict Mode",
    description:
      "All code is fully typed with TypeScript strict mode for maximum safety and IDE support.",
  },
  {
    icon: "📱",
    badge: "Responsive",
    badgeVariant: "badge-primary",
    title: "Custom Breakpoints",
    description:
      "Six responsive breakpoints from xs (480px) to 2xl (1536px) covering all device sizes.",
  },
  {
    icon: "🖼️",
    badge: "Optimized",
    badgeVariant: "badge-accent",
    title: "Image Optimization",
    description:
      "Automatic AVIF and WebP conversion with optimized device sizes for fast loading.",
  },
];

const colorSwatches = [
  { name: "Primary 500", class: "bg-primary-500", hex: "#3461f9" },
  { name: "Primary 300", class: "bg-primary-300", hex: "#8eb5fe" },
  { name: "Secondary 400", class: "bg-secondary-400", hex: "#fbbb25" },
  { name: "Accent 500", class: "bg-accent-500", hex: "#8b5cf6" },
  { name: "Success 500", class: "bg-success-500", hex: "#10b981" },
  { name: "Danger 500", class: "bg-danger-500", hex: "#ef4444" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="section bg-gradient-to-br from-primary-950 via-primary-900 to-accent-950 text-white relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-secondary-400/10 blur-3xl" />
        </div>

        <div className="container relative text-center">
          <span className="badge badge-primary mb-6 text-sm px-4 py-1.5">
            ✦ Next.js 14 · Tailwind · TypeScript
          </span>

          <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            Empower the World
            <br />
            <span className="bg-stellar-gradient-gold bg-clip-text text-transparent">
              with StellarAid
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-primary-200 leading-relaxed mb-10">
            A modern design system built with custom Tailwind tokens, Poppins
            typography, dark mode support, and responsive utilities — ready for
            production.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-lg btn-secondary shadow-glow-gold"
            >
              View Dashboard →
            </Link>
            <Link
              href="/about"
              className="btn-lg btn-ghost border-white/30 text-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Color Palette ─────────────────────────────────────────────── */}
      <section className="section-sm bg-muted/50">
        <div className="container">
          <h2 className="text-center text-2xl font-bold text-foreground mb-2">
            Brand Color Palette
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            StellarAid design tokens accessible via Tailwind utilities
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {colorSwatches.map((swatch) => (
              <div
                key={swatch.name}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`h-16 w-16 rounded-xl ${swatch.class} shadow-stellar-sm ring-1 ring-black/5`}
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">
                    {swatch.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {swatch.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Component Showcase ────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <h2 className="text-center text-2xl font-bold text-foreground mb-2">
            Component Utilities
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Pre-built with Tailwind custom component classes
          </p>

          <div className="card p-6 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Buttons
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-md btn-primary">Primary</button>
              <button className="btn-md btn-secondary">Secondary</button>
              <button className="btn-md btn-accent">Accent</button>
              <button className="btn-md btn-ghost">Ghost</button>
              <button className="btn-md btn-danger">Danger</button>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge-primary">Primary</span>
              <span className="badge-success">Success</span>
              <span className="badge-warning">Warning</span>
              <span className="badge-danger">Danger</span>
              <span className="badge-accent">Accent</span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Typography
            </h3>
            <div className="space-y-2">
              <p className="text-4xl font-extrabold gradient-text">
                Stellar Heading
              </p>
              <p className="text-xl font-semibold text-foreground">
                Section Title — Poppins 600
              </p>
              <p className="text-base text-muted-foreground">
                Body copy with muted foreground color. Poppins 400, 1.5 line
                height.
              </p>
              <p className="text-sm font-mono text-accent-600 dark:text-accent-400">
                Monospace code snippet — font-mono
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────── */}
      <section className="section bg-muted/30">
        <div className="container">
          <h2 className="text-center text-3xl font-bold text-foreground mb-2">
            What&apos;s Included
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to ship fast
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6 animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl">{f.icon}</span>
                  <span className={f.badgeVariant}>{f.badge}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
