'use client';

import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, ArrowUpRight, Activity, Coins, FileCode2 } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  description: string;
}

const STATS: Stat[] = [
  {
    label: "Total Transactions",
    value: 124800,
    suffix: "+",
    icon: <Activity className="w-6 h-6 text-primary" />,
    description: "On-chain transactions verified",
  },
  {
    label: "Total XLM Raised",
    value: 3200000,
    suffix: " XLM",
    icon: <Coins className="w-6 h-6 text-primary" />,
    description: "Raised across all campaigns",
  },
  {
    label: "Contracts Deployed",
    value: 870,
    suffix: "+",
    icon: <FileCode2 className="w-6 h-6 text-primary" />,
    description: "Smart contracts on Stellar",
  },
];

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return count;
}

function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);

  const formatted =
    stat.value >= 1_000_000
      ? (count / 1_000_000).toFixed(1) + "M"
      : stat.value >= 1_000
      ? (count / 1_000).toFixed(0) + "K"
      : count.toString();

  return (
    <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {stat.icon}
      </div>
      <p className="text-4xl font-extrabold text-foreground tabular-nums">
        {formatted}
        <span className="text-primary">{stat.suffix}</span>
      </p>
      <p className="text-base font-semibold text-foreground">{stat.label}</p>
      <p className="text-sm text-muted-foreground">{stat.description}</p>
    </div>
  );
}

export default function TrustStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/40"
      aria-labelledby="trust-stats-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" />
            Blockchain Verified
          </div>
          <h2
            id="trust-stats-heading"
            className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight"
          >
            Trust &amp; Transparency
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Every donation, every milestone, every release — recorded immutably on the Stellar
            blockchain. No black boxes, no hidden fees.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} active={hasAnimated} />
          ))}
        </div>

        {/* Verify link */}
        <div className="text-center">
          <a
            href="https://stellar.expert/explorer/public"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Verify on Stellar Explorer
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
