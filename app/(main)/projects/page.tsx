'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProjectFilters, ProjectFiltersState } from '@/components/projects/ProjectFilters';
import Link from 'next/link';
import { 
  BadgeCheck, 
  Zap, 
  Clock, 
  ArrowRight, 
  ArrowUp, 
  Loader2,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';
import { projectsApi } from '@/lib/api/projects';
import { Project } from '@/types/api';

// Helper to generate mock data for infinite scroll demo
const generateMockProjects = (page: number, limit: number) => {
  const categories = ['Health', 'Education', 'Environment', 'Disaster Relief', 'Energy'];
  const gradients = [
    'from-cyan-400/20 to-blue-500/20',
    'from-blue-400/20 to-indigo-500/20',
    'from-emerald-400/20 to-teal-500/20',
    'from-orange-400/20 to-red-500/20',
    'from-green-400/20 to-emerald-500/20',
    'from-rose-400/20 to-pink-500/20'
  ];
  
  return Array.from({ length: limit }).map((_, i) => {
    const id = (page - 1) * limit + i + 1;
    const target = 10000 + Math.floor(Math.random() * 90000);
    const progress = Math.floor(Math.random() * 100);
    return {
      id: id.toString(),
      title: `Project ${id}: Sustainable ${categories[id % categories.length]} Growth`,
      category: categories[id % categories.length],
      description: `Exploring innovative solutions for ${categories[id % categories.length].toLowerCase()} challenges worldwide.`,
      progress,
      raised: Math.floor((target * progress) / 100),
      goal: target,
      currentAmount: Math.floor((target * progress) / 100).toString(),
      targetAmount: target.toString(),
      isVerified: id % 2 === 0,
      isUrgent: id % 3 === 0,
      status: progress > 90 ? 'almost-funded' : progress >= 100 ? 'completed' : 'active',
      createdAt: new Date(Date.now() - id * 86400000).toISOString(),
      imageGradient: gradients[id % gradients.length],
    };
  });
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const [filters, setFilters] = useState<ProjectFiltersState>({
    sort: 'newest',
    verifiedOnly: false,
    status: 'all',
    urgentOnly: false,
  });

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Handle scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProjects = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    if (isLoading || (!hasMore && !isNewFilter)) return;
    
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, you'd use projectsApi.getProjects(pageNum, 10, filters)
      const newItems = generateMockProjects(pageNum, 9);
      
      if (isNewFilter) {
        setProjects(newItems);
        setPage(1);
        setHasMore(true);
      } else {
        setProjects(prev => [...prev, ...newItems]);
      }
      
      // For demo, stop after 5 pages
      if (pageNum >= 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // Initial fetch and filter change
  useEffect(() => {
    fetchProjects(1, true);
  }, [filters]);

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProjects(nextPage);
    }
  }, [inView, hasMore, isLoading, page, fetchProjects]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      {/* Header Section */}
      <div className="relative bg-white pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-secondary-50/30 to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-[1280px] relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-primary-600 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Explore Opportunities
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 mb-6 tracking-tight">
            Support <span className="gradient-text">Impactful</span> Projects
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            Discover verified initiatives across the globe. From emergency relief to long-term sustainable development, your Stellar contributions drive real change.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <ProjectFilters onFiltersChange={setFilters} />

      {/* Projects Grid */}
      <main className="container mx-auto px-4 py-12 max-w-[1280px]">
        {projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 flex flex-col h-full animate-fade-in"
                >
                  {/* Card Image area */}
                  <div className={`relative h-56 w-full bg-gradient-to-br ${project.imageGradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-300" />
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {project.isVerified && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                          <BadgeCheck className="w-4 h-4 text-primary-500" />
                          <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">Verified</span>
                        </div>
                      )}
                      {project.isUrgent && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-500/90 backdrop-blur-md rounded-full shadow-sm text-white">
                          <Zap className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Urgent</span>
                        </div>
                      )}
                    </div>

                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                      <div className="w-8 h-8 rounded-full bg-white/80 shadow-inner" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-[0.1em]">
                        {project.category}
                      </span>
                      <span className={clsx(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                        project.status === 'completed' ? "bg-success-50 text-success-700" : 
                        project.status === 'almost-funded' ? "bg-warning-50 text-warning-700" :
                        "bg-primary-50 text-primary-700"
                      )}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>

                    <div className="mt-auto space-y-6">
                      {/* Progress Section */}
                      <div>
                        <div className="flex justify-between items-end mb-2.5">
                          <span className="text-sm font-semibold text-neutral-400">Progress</span>
                          <span className="text-sm font-bold text-neutral-900">{project.progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Funding Section */}
                      <div className="flex justify-between items-center gap-4 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[15px] text-neutral-600">
                            <span className="font-bold text-neutral-900">${(Number(project.raised) || 0).toLocaleString()}</span>
                            <span className="mx-1 text-neutral-400">of</span>
                            <span className="text-neutral-500">${(Number(project.goal) || 0).toLocaleString()}</span>
                          </span>
                        </div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="px-5 py-2 rounded-lg border border-neutral-200 text-sm font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm flex items-center gap-2 group/btn"
                        >
                          Donate
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Trigger & Loading State */}
            <div ref={ref} className="mt-12 py-8 flex flex-col items-center justify-center">
              {isLoading && (
                <div className="flex flex-col items-center gap-3 text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  <p className="text-sm font-bold animate-pulse">Loading more impacts...</p>
                </div>
              )}
              {!hasMore && projects.length > 0 && (
                <div className="flex flex-col items-center gap-3 text-neutral-400 py-4">
                  <div className="w-12 h-px bg-neutral-200" />
                  <p className="text-sm font-bold">You've reached the end of the galaxy</p>
                  <div className="w-12 h-px bg-neutral-200" />
                </div>
              )}
            </div>
          </>
        ) : !isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-neutral-300">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No projects found</h3>
            <p className="text-neutral-500 text-center max-w-sm mb-8">
              We couldn't find any projects matching your current filters. Try adjusting your search or clear all filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ sort: 'newest', verifiedOnly: false, status: 'all', urgentOnly: false } as ProjectFiltersState)}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[450px] bg-white rounded-2xl animate-pulse border border-neutral-100" />
            ))}
          </div>
        )}
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white text-primary-600 rounded-full shadow-stellar-lg border border-neutral-100 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 animate-fade-in group"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
