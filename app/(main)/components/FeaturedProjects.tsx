'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  BadgeCheck, 
  TrendingUp,
  ExternalLink,
  Bookmark
} from 'lucide-react';
import { projectsApi } from '@/lib/api/projects';
import { Project } from '@/types/api';
import { clsx } from 'clsx';
import { useBookmarkStore } from '@/store/bookmarkStore';

// Fallback data if API fails or for demo purposes
const fallbackProjects = [
  {
    id: '1',
    title: 'Global Reforestation Initiative',
    description: 'Planting 1 million trees across South America to restore critical ecosystems.',
    category: 'Environment',
    currentAmount: '85000',
    targetAmount: '100000',
    imageGradient: 'from-emerald-500/20 to-teal-600/20',
    isVerified: true,
  },
  {
    id: '2',
    title: 'Clean Water for Rural Communities',
    description: 'Building sustainable water filtration systems in remote villages.',
    category: 'Health',
    currentAmount: '21000',
    targetAmount: '50000',
    imageGradient: 'from-cyan-500/20 to-blue-600/20',
    isVerified: true,
  },
  {
    id: '3',
    title: 'Tech Education for Youth',
    description: 'Providing laptops and coding workshops to underprivileged students.',
    category: 'Education',
    currentAmount: '27200',
    targetAmount: '40000',
    imageGradient: 'from-indigo-500/20 to-violet-600/20',
    isVerified: false,
  },
  {
    id: '4',
    title: 'Emergency Disaster Relief',
    description: 'Rapid response team providing food and medical aid to flood victims.',
    category: 'Humanitarian',
    currentAmount: '19000',
    targetAmount: '20000',
    imageGradient: 'from-orange-500/20 to-red-600/20',
    isVerified: true,
  }
];

const FeaturedProjects = () => {
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFeatured = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await projectsApi.getFeaturedProjects();
      if (response.data && response.data.length > 0) {
        setProjects(response.data.map((p, i) => ({
          ...p,
          imageGradient: fallbackProjects[i % fallbackProjects.length].imageGradient
        })));
      } else {
        setProjects(fallbackProjects);
      }
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      setProjects(fallbackProjects);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  }, [projects.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isAutoPlaying && projects.length > 0) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, nextSlide, projects.length]);

  if (isLoading && projects.length === 0) {
    return (
      <section className="py-24 bg-[#f0f4fa]/30">
        <div className="container mx-auto px-4">
          <div className="h-[400px] bg-white/50 animate-pulse rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-24 bg-gradient-to-b from-[#f0f4fa]/50 to-white overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="container px-4 mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-primary-600 text-xs font-bold uppercase tracking-wider mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending Now
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight">
              Featured <span className="gradient-text">Impacts</span>
            </h2>
            <p className="text-neutral-500 text-lg font-medium max-w-xl">
              High-priority projects making waves in our community. Join the movement.
            </p>
          </div>
          
          <Link 
            href="/projects?filter=featured" 
            className="group flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-all"
          >
            View All Featured
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          <div className="relative h-[480px] md:h-[420px] w-full">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={clsx(
                  "absolute inset-0 transition-all duration-700 ease-in-out transform",
                  index === currentIndex 
                    ? "opacity-100 translate-x-0 scale-100 z-20" 
                    : index < currentIndex 
                      ? "opacity-0 -translate-x-full scale-95 z-10" 
                      : "opacity-0 translate-x-full scale-95 z-10"
                )}
              >
                <div className="h-full bg-white rounded-3xl border border-neutral-100 shadow-stellar-lg overflow-hidden flex flex-col md:flex-row">
                  {/* Image/Visual Area */}
                  <div className={clsx(
                    "relative w-full md:w-2/5 h-48 md:h-full bg-gradient-to-br",
                    project.imageGradient
                  )}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                         <div className="w-12 h-12 rounded-full bg-white/40 shadow-inner" />
                      </div>
                    </div>
                    {project.isVerified && (
                      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                        <BadgeCheck className="w-4 h-4 text-primary-500" />
                        <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">Verified</span>
                      </div>
                    )}

                    {/* Bookmark Toggle */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(project.id);
                      }}
                      className={clsx(
                        "absolute top-6 right-6 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border",
                        isBookmarked(project.id)
                          ? "bg-primary-500 border-primary-400 text-white shadow-glow"
                          : "bg-white/70 border-white/40 text-neutral-600 hover:bg-white hover:text-primary-500"
                      )}
                    >
                      <Bookmark className={clsx("w-6 h-6", isBookmarked(project.id) && "fill-current")} />
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-8 md:p-12 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-secondary-500 uppercase tracking-[0.2em]">
                        {project.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-neutral-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Top Pick
                      </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-4 line-clamp-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-neutral-500 text-base md:text-lg mb-8 line-clamp-2 md:line-clamp-3">
                      {project.description || "No description available for this featured project."}
                    </p>

                    <div className="mt-auto space-y-6">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <div className="flex flex-col">
                            <span className="text-[15px] text-neutral-600">
                              <span className="font-bold text-neutral-900">${(Number(project.currentAmount) || 0).toLocaleString()}</span>
                              <span className="mx-1 text-neutral-400">of</span>
                              <span className="text-neutral-500">${(Number(project.targetAmount) || 0).toLocaleString()}</span>
                            </span>
                          </div>
                          <span className="text-lg font-black text-primary-600">
                            {Math.round((Number(project.currentAmount) / Number(project.targetAmount)) * 100) || 0}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min((Number(project.currentAmount) / Number(project.targetAmount)) * 100 || 0, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Link
                          href={`/projects/${project.id}`}
                          className="px-8 py-3.5 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-neutral-200 active:scale-95"
                        >
                          View Project
                        </Link>
                        <button className="p-3.5 rounded-xl border border-neutral-200 hover:border-primary-200 hover:bg-primary-50 transition-all text-neutral-400 hover:text-primary-600">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white shadow-stellar flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white shadow-stellar flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-3 mt-12">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "w-8 bg-primary-500" : "w-2 bg-neutral-200 hover:bg-neutral-300"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
