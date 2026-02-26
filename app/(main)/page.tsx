import type { Metadata } from "next";
import Link from "next/link";
import { WhyChooseUs } from "./components/WhyChooseUs";


export const metadata: Metadata = {
  title: "Home",
  description: "StellarAid — Empowering communities through technology",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col items-center justify-center px-4 py-20">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="w-full max-w-3xl mx-auto text-center relative overflow-hidden rounded-2xl">

        {/* Foreground content sits above the canvas */}
        <div className="relative z-10 py-20 px-6">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
            Know that your donation
            <br />
            is making a difference
          </h1>

          {/* Sub-copy */}
          <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
            StellarAid uses blockchain transparency to prove every single project you fund,
            complete with verification and real-time impact tracking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-colors"
              style={{ backgroundColor: "#1e40af" }}
            >
              Donate Now
            </Link>
            <Link
              href="/about"
              className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Stats Card — frosted glass so particles show through */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 py-7 px-6 flex flex-wrap justify-center gap-10 sm:gap-16">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-blue-600">$2.4M</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Donated</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-yellow-500">12.5K</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Projects</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-green-500">89K</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Donors</span>
            </div>
          </div>
        </div>
      </section>
      <section>
        <WhyChooseUs />
      </section>
    </div>
  );
}
