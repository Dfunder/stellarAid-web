'use client';

import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Zap, ArrowRight, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { ShareButton } from './ShareButton';

export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    category: string;
    imageGradient?: string;
    isVerified?: boolean;
    isUrgent?: boolean;
    status?: 'active' | 'completed' | 'almost-funded';
    progress?: number;
    currentAmount?: number;
    targetAmount?: number;
    raised?: number;
    goal?: number;
    imageUrl?: string;
  };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { toggleBookmark, isBookmarked } = useBookmarkStore();

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border flex flex-col h-full animate-fade-in"
    >
      {/* Card Image area */}
      <div className={clsx(
        "relative h-56 w-full bg-gradient-to-br flex items-center justify-center overflow-hidden",
        project.imageGradient || 'from-muted to-muted/50'
      )}>
        <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors duration-300" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {project.isVerified && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-full shadow-sm">
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Verified</span>
            </div>
          )}
          {project.isUrgent && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/90 backdrop-blur-md rounded-full shadow-sm text-secondary-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Urgent</span>
            </div>
          )}
        </div>

        {/* Bookmark Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(project.id);
          }}
          className={clsx(
            "absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border",
            isBookmarked(project.id)
              ? "bg-primary border-primary/80 text-primary-foreground shadow-glow"
              : "bg-background/70 border-background/40 text-muted-foreground hover:bg-background hover:text-primary"
          )}
        >
          <Bookmark className={clsx("w-5 h-5", isBookmarked(project.id) && "fill-current")} />
        </button>

        <div className="w-16 h-16 rounded-full bg-background/30 backdrop-blur-md border border-background/40 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
          <div className="w-8 h-8 rounded-full bg-background/80 shadow-inner" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-7 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.1em]">
            {project.category}
          </span>
          <span className={clsx(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
            project.status === 'completed' ? "bg-success/10 text-success" : 
            project.status === 'almost-funded' ? "bg-warning/10 text-warning" :
            "bg-primary/10 text-primary"
          )}>
            {project.status?.replace('-', ' ') || 'Active'}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors line-clamp-2">
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
                style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Funding Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col">
              <span className="text-[15px] text-neutral-600">
                <span className="font-bold text-neutral-900">${(Number(project.currentAmount || project.raised) || 0).toLocaleString()}</span>
                <span className="mx-1 text-neutral-400">of</span>
                <span className="text-neutral-500">${(Number(project.targetAmount || project.goal) || 0).toLocaleString()}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <ShareButton projectId={project.id} projectTitle={project.title} projectUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/projects/${project.id}`} />
              <Link
                href={`/projects/${project.id}`}
                className="flex-1 px-5 py-2 rounded-lg border border-neutral-200 text-sm font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 group/btn"
              >
                Donate
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;