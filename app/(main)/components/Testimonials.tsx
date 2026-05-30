'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  campaignName: string;
  quote: string;
  amountRaised: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Amara Diallo",
    avatar: "AD",
    campaignName: "Clean Water for Dakar",
    quote:
      "StellarAid made it possible for our village to raise funds from donors worldwide. Every transaction was visible on-chain — donors trusted us because of that transparency.",
    amountRaised: "12,400 XLM",
  },
  {
    id: 2,
    name: "Lena Müller",
    avatar: "LM",
    campaignName: "Solar Schools Initiative",
    quote:
      "We hit our goal in 3 weeks. The automated fund release when milestones were met gave our donors confidence that their money was being used exactly as promised.",
    amountRaised: "28,750 XLM",
  },
  {
    id: 3,
    name: "Carlos Reyes",
    avatar: "CR",
    campaignName: "Earthquake Relief — Oaxaca",
    quote:
      "In a crisis, speed matters. StellarAid let us receive and deploy funds within hours, not weeks. The blockchain record meant zero questions about where the money went.",
    amountRaised: "54,200 XLM",
  },
  {
    id: 4,
    name: "Priya Nair",
    avatar: "PN",
    campaignName: "Girls' Education Fund",
    quote:
      "Our donors are spread across 18 countries. StellarAid's multi-asset support meant everyone could contribute in their preferred currency. Truly borderless fundraising.",
    amountRaised: "19,600 XLM",
  },
  {
    id: 5,
    name: "James Okafor",
    avatar: "JO",
    campaignName: "Urban Reforestation Lagos",
    quote:
      "The on-chain transparency wasn't just a feature — it was our biggest fundraising tool. Donors could verify every XLM we received and spent. Trust built itself.",
    amountRaised: "8,900 XLM",
  },
];

const AUTOPLAY_INTERVAL = 4500;

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = TESTIMONIALS.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    },
    [prev, next]
  );

  const t = TESTIMONIALS[current] as Testimonial;

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight"
          >
            Success Stories
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Real campaigns, real impact — verified on the Stellar blockchain.
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={trackRef}
          role="region"
          aria-label="Testimonials carousel"
          aria-live="polite"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
        >
          {/* Card */}
          <div
            key={t.id}
            className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm"
          >
            <Quote className="w-8 h-8 text-primary/30 mb-4" aria-hidden="true" />
            <p className="text-lg sm:text-xl text-foreground leading-relaxed font-medium mb-8">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.campaignName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Raised</p>
                <p className="text-sm font-bold text-primary">{t.amountRaised}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            {/* Dot indicators */}
            <div className="flex gap-2" role="tablist" aria-label="Testimonial slides">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
