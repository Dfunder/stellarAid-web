'use client';

import React from 'react';
import Link from 'next/link';
import {
  Palette,
  Layers,
  Layout,
  Camera,
  Film,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Grid,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface CategoryItem {
  id: string;
  name: string;
  count: string;
  countNumber: number;
  icon: React.ElementType;
  description: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'illustration',
    name: 'Illustration',
    count: '1,420 items',
    countNumber: 1420,
    icon: Palette,
    description: 'Digital art, character design, concept art, and vector artwork',
    gradient: 'from-purple-500 to-indigo-600',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    glowColor: 'group-hover:shadow-purple-500/20',
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    count: '2,150 items',
    countNumber: 2150,
    icon: Layers,
    description: 'Logos, marketing assets, print media, branding & posters',
    gradient: 'from-blue-500 to-cyan-600',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    glowColor: 'group-hover:shadow-blue-500/20',
  },
  {
    id: 'ui-ux',
    name: 'UI/UX',
    count: '3,890 items',
    countNumber: 3890,
    icon: Layout,
    description: 'Mobile applications, web interfaces, design systems & prototypes',
    gradient: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    glowColor: 'group-hover:shadow-emerald-500/20',
  },
  {
    id: 'photography',
    name: 'Photography',
    count: '980 items',
    countNumber: 980,
    icon: Camera,
    description: 'Portrait, landscape, commercial, product & editorial photos',
    gradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    glowColor: 'group-hover:shadow-amber-500/20',
  },
  {
    id: 'animation',
    name: 'Animation',
    count: '760 items',
    countNumber: 760,
    icon: Film,
    description: '2D/3D motion graphics, VFX, 3D render & character animation',
    gradient: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    glowColor: 'group-hover:shadow-rose-500/20',
  },
  {
    id: 'branding',
    name: 'Branding',
    count: '1,120 items',
    countNumber: 1120,
    icon: Sparkles,
    description: 'Brand identities, style guides, packaging & typography design',
    gradient: 'from-violet-500 to-purple-600',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
    badgeText: 'text-violet-700 dark:text-violet-300',
    glowColor: 'group-hover:shadow-violet-500/20',
  },
];

export interface CategoriesShowcaseProps {
  categories?: CategoryItem[];
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
  showViewAll?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.215, 0.61, 0.355, 1.0] as const,
    },
  },
};

export default function CategoriesShowcase({
  categories = DEFAULT_CATEGORIES,
  title = 'Browse by Creative Discipline',
  subtitle = 'Portfolio Categories',
  description = 'Explore top creative talent and inspiring portfolios across industry-leading design disciplines.',
  className = '',
  showViewAll = true,
}: CategoriesShowcaseProps) {
  return (
    <section
      aria-labelledby="categories-showcase-heading"
      className={cn(
        'py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950/50 transition-colors',
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          {subtitle && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 mb-4">
              <Grid className="w-3.5 h-3.5" />
              {subtitle}
            </span>
          )}
          <h2
            id="categories-showcase-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const exploreUrl = `/explore?category=${encodeURIComponent(category.name)}`;

            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  href={exploreUrl}
                  prefetch={true}
                  className={cn(
                    'group relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none',
                    category.glowColor
                  )}
                >
                  {/* Top Row: Icon & Count Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div
                        className={cn(
                          'p-3.5 rounded-2xl bg-gradient-to-br text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 ease-out',
                          category.gradient
                        )}
                      >
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-medium border border-black/5 dark:border-white/10',
                          category.badgeBg,
                          category.badgeText
                        )}
                      >
                        {category.count}
                      </span>
                    </div>

                    {/* Category Title & Description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    <span>Explore portfolios</span>
                    <div className="flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-200 ease-out">
                      <span className="sr-only">Go to {category.name} category</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Call to Action */}
        {showViewAll && (
          <div className="mt-12 md:mt-16 text-center">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-500 shadow-md hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
