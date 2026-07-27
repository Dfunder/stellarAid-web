'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/* ─── Floating orb (purely decorative) ─── */
function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`}
      style={{ animationDelay: `${delay}ms`, animationDuration: '4000ms' }}
    />
  );
}

/* ─── Animated stat for social proof ─── */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <p
        className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-neutral-400">{label}</p>
    </div>
  );
}

/* ─── Main Hero component ─── */
export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero section"
      className="relative isolate min-h-[100svh] flex flex-col overflow-hidden bg-neutral-950"
    >
      {/* ── Animated gradient mesh background ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(109,40,217,0.35) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 50% at 80% 60%, rgba(249,115,22,0.25) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%)',
        }}
      />

      {/* ── Floating decorative orbs ── */}
      <Orb className="top-1/4 -left-32 w-96 h-96 bg-primary-700" delay={0} />
      <Orb className="bottom-1/4 -right-32 w-80 h-80 bg-secondary-600" delay={1500} />
      <Orb
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-500"
        delay={3000}
      />

      {/* ── Grid noise texture overlay ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 50%), ' +
            'repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Content wrapper ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Badge */}
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border border-primary-700/40 bg-primary-900/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-300 backdrop-blur-sm transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Powered by the Stellar Network
        </div>

        {/* Headline */}
        <h1
          className={`max-w-4xl text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Where{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              Creative Talent
            </span>
            {/* Underline accent */}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-60"
            />
          </span>{' '}
          Meets Global Opportunity
        </h1>

        {/* Sub-headline */}
        <p
          className={`mt-6 max-w-2xl text-center text-lg sm:text-xl text-neutral-300 leading-relaxed transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Discover, fund, and collaborate with the world&apos;s most talented creatives — artists,
          musicians, designers, and more — all on a transparent blockchain-powered platform.
        </p>

        {/* CTA buttons */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Link
            href="/explore"
            id="hero-cta-explore"
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-900/40 ring-1 ring-primary-500/30 transition-all duration-200 hover:from-primary-500 hover:to-primary-600 hover:shadow-primary-800/60 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent group-hover:before:translate-x-full before:transition-transform before:duration-700"
            />
            <svg
              className="h-5 w-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path
                fillRule="evenodd"
                d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            Explore Creatives
          </Link>

          <Link
            href="/register"
            id="hero-cta-earn"
            className="group relative inline-flex items-center gap-2 rounded-2xl border border-secondary-500/50 bg-secondary-500/10 px-8 py-4 text-base font-semibold text-secondary-300 backdrop-blur-sm transition-all duration-200 hover:bg-secondary-500/20 hover:border-secondary-400 hover:text-secondary-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
            Start Earning
          </Link>
        </div>

        {/* Social proof stats */}
        <div
          className={`mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <AnimatedStat value="12K+" label="Creative Profiles" />
          <AnimatedStat value="$4.2M" label="Funds Raised" />
          <AnimatedStat value="98" label="Countries Reached" />
        </div>
      </div>

      {/* ── Artwork imagery panel ── */}
      <div
        className={`relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 transition-all duration-1000 delay-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mx-auto max-w-5xl">
          {/* Glow behind image */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-16 h-40 bg-gradient-to-r from-primary-700/20 via-accent-600/20 to-secondary-600/20 blur-3xl"
          />

          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary-950/60 ring-1 ring-white/5">
            {/* Browser chrome top bar */}
            <div className="flex items-center gap-2 bg-neutral-900/80 px-4 py-2.5 backdrop-blur-sm border-b border-white/5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-neutral-500 font-mono">lumora.io / explore</span>
            </div>

            <Image
              src="/hero-artwork.png"
              alt="A vibrant collage of creative artworks floating in a purple-to-orange gradient space"
              width={1280}
              height={720}
              priority
              className="w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
            />

            {/* Gradient overlay at bottom of image */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent"
            />

            {/* Floating card – top-left (offset below the chrome bar ~40px) */}
            <div className="absolute top-14 left-4 hidden sm:flex items-center gap-3 rounded-xl bg-neutral-900/80 backdrop-blur-md px-4 py-2.5 border border-white/10 shadow-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-white text-sm font-bold">
                A
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Aisha Designs</p>
                <p className="text-[10px] text-neutral-400">Digital Illustrator · Lagos</p>
              </div>
            </div>

            {/* Floating card – bottom-right */}
            <div className="absolute bottom-6 right-4 hidden sm:flex items-center gap-2 rounded-xl bg-neutral-900/80 backdrop-blur-md px-4 py-2.5 border border-white/10 shadow-lg">
              <svg
                className="h-4 w-4 text-secondary-400 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs font-semibold text-white">
                <span className="text-secondary-400">247</span> creatives funded this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom fade into next section ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent"
      />
    </section>
  );
}
