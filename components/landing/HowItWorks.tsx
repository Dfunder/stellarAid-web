'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Wallet,
  CheckCircle2,
  Gift,
  UserPlus,
  Rocket,
  Users,
  BadgeDollarSign,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export type TabType = 'clients' | 'artists';

export interface StepItem {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badgeText: string;
  highlights: string[];
}

export const CLIENT_STEPS: StepItem[] = [
  {
    id: 1,
    number: '01',
    title: 'Discover Artists',
    subtitle: 'Explore Verified Talent',
    description:
      'Browse curated artist profiles, listen to music samples, and find creative projects seeking community backing or custom commissions.',
    icon: Search,
    badgeText: 'Step 1',
    highlights: ['Vetted creators', 'Genre filtering', 'Transparent goals'],
  },
  {
    id: 2,
    number: '02',
    title: 'Fund or Commission',
    subtitle: 'Instant Stellar Payments',
    description:
      'Back campaigns directly or hire artists for custom work using micro-donations powered by fast, low-fee Stellar blockchain transactions.',
    icon: Wallet,
    badgeText: 'Step 2',
    highlights: ['Near-zero fees', 'Instant settlement', 'Escrow protection'],
  },
  {
    id: 3,
    number: '03',
    title: 'Track Milestones',
    subtitle: 'Real-Time Transparency',
    description:
      'Follow creative progress through live project updates, financial breakdown reports, and milestone-based release schedules.',
    icon: CheckCircle2,
    badgeText: 'Step 3',
    highlights: ['Live updates', 'Proof of progress', 'Community feed'],
  },
  {
    id: 4,
    number: '04',
    title: 'Receive Rewards',
    subtitle: 'Exclusive Deliverables',
    description:
      'Unlock exclusive perks, early track releases, digital collectables, or finished commission deliverables sent straight to your account.',
    icon: Gift,
    badgeText: 'Step 4',
    highlights: ['Exclusive perks', 'Digital assets', 'Direct artist link'],
  },
];

export const ARTIST_STEPS: StepItem[] = [
  {
    id: 1,
    number: '01',
    title: 'Create Your Profile',
    subtitle: 'Showcase Your Craft',
    description:
      'Set up your artist profile, link audio previews, upload portfolio media, and verify your identity on the StellarAid network.',
    icon: UserPlus,
    badgeText: 'Step 1',
    highlights: ['Quick setup', 'Audio previews', 'Custom branding'],
  },
  {
    id: 2,
    number: '02',
    title: 'Launch Campaign',
    subtitle: 'Define Funding Goals',
    description:
      'Set clear funding targets for your album, equipment, or tour with automated milestone-based smart contracts for donor confidence.',
    icon: Rocket,
    badgeText: 'Step 2',
    highlights: ['Milestone smart contracts', 'Transparent targets', 'No setup fee'],
  },
  {
    id: 3,
    number: '03',
    title: 'Engage Supporters',
    subtitle: 'Build Global Fanbase',
    description:
      'Share project updates, offer exclusive rewards to backers, and collaborate directly with clients requesting custom work.',
    icon: Users,
    badgeText: 'Step 3',
    highlights: ['Global reach', 'Direct messaging', 'Fan engagement'],
  },
  {
    id: 4,
    number: '04',
    title: 'Get Paid Fast',
    subtitle: 'Direct Micro-Payouts',
    description:
      'Receive funds instantly as milestones are completed, keeping 100% control of your earnings with minimal platform overhead.',
    icon: BadgeDollarSign,
    badgeText: 'Step 4',
    highlights: ['Instant withdrawal', 'Low transaction fee', 'Full ownership'],
  },
];

export interface HowItWorksProps {
  className?: string;
  defaultTab?: TabType;
}

export function HowItWorks({ className = '', defaultTab = 'clients' }: HowItWorksProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [activeStepId, setActiveStepId] = useState<number>(1);

  const steps = activeTab === 'clients' ? CLIENT_STEPS : ARTIST_STEPS;
  const currentActiveStep = steps.find((s) => s.id === activeStepId) || steps[0]!;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveStepId(1);
  };

  return (
    <section
      id="how-it-works"
      aria-label="How It Works"
      className={`py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/50 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span>Seamless Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            How <span className="bg-lumora-gradient bg-clip-text text-transparent">StellarAid</span>{' '}
            Works
          </h2>

          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Empowering clients and creators through direct blockchain backing. Simple steps to fund,
            collaborate, and grow.
          </p>

          {/* Toggle Tabs */}
          <div className="mt-8 flex justify-center">
            <div
              role="tablist"
              aria-label="Target audience workflow"
              className="inline-flex p-1.5 rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-300/50 dark:border-neutral-700/50 shadow-inner"
            >
              <button
                type="button"
                role="tab"
                id="tab-clients"
                aria-selected={activeTab === 'clients'}
                aria-controls="panel-clients"
                onClick={() => handleTabChange('clients')}
                className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  activeTab === 'clients'
                    ? 'text-primary-950 dark:text-white shadow-md'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {activeTab === 'clients' && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-white dark:bg-primary-900/90 rounded-xl shadow-xs border border-neutral-200/60 dark:border-primary-700/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Briefcase className="w-4 h-4 relative z-10" />
                <span className="relative z-10">For Clients</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-artists"
                aria-selected={activeTab === 'artists'}
                aria-controls="panel-artists"
                onClick={() => handleTabChange('artists')}
                className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  activeTab === 'artists'
                    ? 'text-primary-950 dark:text-white shadow-md'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {activeTab === 'artists' && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-white dark:bg-primary-900/90 rounded-xl shadow-xs border border-neutral-200/60 dark:border-primary-700/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">For Artists</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Panel Content */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="w-full"
        >
          {/* DESKTOP STEPPER (Horizontal) */}
          <div className="hidden lg:block">
            {/* Desktop Stepper Bar Header */}
            <div className="relative mb-12">
              {/* Stepper Connecting Line */}
              <div className="absolute top-1/2 left-12 right-12 h-1 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 z-0 rounded-full" />
              <motion.div
                className="absolute top-1/2 left-12 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                style={{
                  width: `calc(${((activeStepId - 1) / (steps.length - 1)) * 100}% - ${
                    (activeStepId - 1) * 6
                  }px)`,
                }}
              />

              <div className="relative z-10 grid grid-cols-4 gap-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id === activeStepId;
                  const isCompleted = step.id < activeStepId;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepId(step.id)}
                      className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-2xl p-2 transition-transform duration-200 hover:scale-102"
                    >
                      {/* Step Circle Icon */}
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-md ${
                          isActive
                            ? 'bg-primary-600 dark:bg-primary-600 text-white border-primary-500 ring-4 ring-primary-100 dark:ring-primary-950/80 scale-110'
                            : isCompleted
                              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                              : 'bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border-neutral-300 dark:border-neutral-800 group-hover:border-primary-400 dark:group-hover:border-primary-600 group-hover:text-primary-600'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      {/* Step Label */}
                      <div className="mt-4">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-900/80 text-primary-700 dark:text-primary-300'
                              : 'text-neutral-400 dark:text-neutral-500'
                          }`}
                        >
                          Step {step.number}
                        </span>
                        <h3
                          className={`mt-1.5 text-base font-bold transition-colors ${
                            isActive
                              ? 'text-neutral-900 dark:text-white'
                              : 'text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
                          }`}
                        >
                          {step.title}
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Active Step Detail Card Display & 4-Grid Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeStepId}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-12 gap-8 items-stretch"
              >
                {/* Main Feature Highlight Card */}
                <div className="col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-black text-primary-600/30 dark:text-primary-400/20 font-mono">
                        {currentActiveStep.number}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary-100 dark:bg-secondary-950/80 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800/50">
                        {currentActiveStep.subtitle}
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">
                      {currentActiveStep.title}
                    </h3>

                    <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed mb-8">
                      {currentActiveStep.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Key Features & Advantages
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {currentActiveStep.highlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 text-sm text-neutral-800 dark:text-neutral-200 font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Footer Controls */}
                  <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                      <span>Step {activeStepId} of 4</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={activeStepId === 1}
                        onClick={() => setActiveStepId((prev) => Math.max(1, prev - 1))}
                        className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStepId((prev) => (prev < steps.length ? prev + 1 : 1))
                        }
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                      >
                        <span>
                          {activeStepId === steps.length ? 'Replay Workflow' : 'Next Step'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4-Step Summary Grid List (Desktop Side Panel) */}
                <div className="col-span-5 flex flex-col justify-between gap-3">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    const isActive = step.id === activeStepId;

                    return (
                      <div
                        key={step.id}
                        onClick={() => setActiveStepId(step.id)}
                        className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                          isActive
                            ? 'bg-white dark:bg-neutral-900 border-primary-500 dark:border-primary-500 shadow-md ring-2 ring-primary-500/20'
                            : 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/80 dark:border-neutral-800/80 hover:bg-white dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-950 group-hover:text-primary-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500">
                              {step.number}
                            </span>
                            <h4
                              className={`text-sm font-bold truncate ${
                                isActive
                                  ? 'text-neutral-900 dark:text-white'
                                  : 'text-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                            {step.subtitle}
                          </p>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 flex-shrink-0 transition-transform ${
                            isActive
                              ? 'text-primary-600 dark:text-primary-400 translate-x-1'
                              : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* MOBILE & TABLET STEPPER (Vertical) */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="relative pl-6 sm:pl-8 space-y-8"
              >
                {/* Mobile Vertical Stepper Timeline Line */}
                <div className="absolute top-4 bottom-4 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-primary-600 via-secondary-500 to-neutral-200 dark:to-neutral-800 -translate-x-1/2 z-0" />

                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === steps.length - 1;

                  return (
                    <div key={step.id} className="relative z-10">
                      <div className="flex items-start gap-4 sm:gap-6">
                        {/* Vertical Stepper Circle Badge */}
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 shadow-md font-bold -ml-6 sm:-ml-8">
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Step Card Content */}
                        <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-md transition-shadow hover:shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400 font-mono">
                              Step {step.number}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                              {step.subtitle}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                            {step.title}
                          </h3>

                          <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-4">
                            {step.description}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            {step.highlights.map((highlight, hIdx) => (
                              <span
                                key={hIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60"
                              >
                                <CheckCircle2 className="w-3 h-3 text-primary-500" />
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
