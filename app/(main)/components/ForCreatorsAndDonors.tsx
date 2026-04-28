import React from "react";
import Link from "next/link";
import { Rocket, BarChart3, Coins, Globe, ShieldCheck, Eye, Zap, Lock } from "lucide-react";

const creatorFeatures = [
  { icon: <Rocket className="w-5 h-5" />, text: "Launch campaigns in minutes" },
  { icon: <BarChart3 className="w-5 h-5" />, text: "Real-time donation tracking" },
  { icon: <Coins className="w-5 h-5" />, text: "Accept XLM & Stellar assets" },
  { icon: <Globe className="w-5 h-5" />, text: "Reach a global donor base" },
];

const donorFeatures = [
  { icon: <ShieldCheck className="w-5 h-5" />, text: "Verified, trusted projects only" },
  { icon: <Eye className="w-5 h-5" />, text: "On-chain transaction transparency" },
  { icon: <Zap className="w-5 h-5" />, text: "Near-zero fees via Stellar" },
  { icon: <Lock className="w-5 h-5" />, text: "Secure wallet integration" },
];

export default function ForCreatorsAndDonors() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Creators */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">For Creators</span>
          <h3 className="mt-3 text-2xl font-extrabold text-foreground">
            Launch your campaign today
          </h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Create a verified fundraising campaign and connect with donors worldwide through blockchain transparency.
          </p>
          <ul className="mt-6 space-y-3">
            {creatorFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                <span className="text-primary">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup"
            className="mt-8 inline-block px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Start a Campaign
          </Link>
        </div>

        {/* For Donors */}
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">For Donors</span>
          <h3 className="mt-3 text-2xl font-extrabold text-foreground">
            Give with confidence
          </h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Every donation is recorded on the Stellar blockchain — fully transparent, verifiable, and impactful.
          </p>
          <ul className="mt-6 space-y-3">
            {donorFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                <span className="text-secondary">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
          <Link
            href="/explore"
            className="mt-8 inline-block px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors"
          >
            Explore Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
