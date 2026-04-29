'use client';

import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { projectsApi } from '@/lib/api/projects';
import { 
  Bookmark, 
  Loader2, 
  ArrowLeft, 
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type ProjectCardProject = React.ComponentProps<typeof ProjectCard>['project'];

export default function BookmarksPage() {
  const { bookmarkedIds } = useBookmarkStore();
  const [bookmarkedProjects, setBookmarkedProjects] = useState<ProjectCardProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true);
      try {
        // Fetch full project details for the bookmarked IDs
        const response = await projectsApi.getBookmarkedProjects();
        if (response.data) {
          // Add some UI enhancements like gradients since they might not come from API
          const enriched = response.data.map((p, i) => ({
            ...p,
            category: p.category ?? 'Community',
            progress: Math.round((Number(p.currentAmount) / Number(p.targetAmount)) * 100) || 0,
            imageGradient: i % 2 === 0 ? 'from-primary-400/20 to-accent-500/20' : 'from-secondary-400/20 to-danger-500/20'
          }));
          setBookmarkedProjects(enriched);
        }
      } catch (error) {
        console.error('Failed to load bookmarked projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [bookmarkedIds]); // Reload when bookmarks change

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      {/* Header Section */}
      <div className="bg-white pt-24 pb-12 border-b border-neutral-100">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <Link 
            href="/projects" 
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-primary-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Explore
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-3 tracking-tight flex items-center gap-4">
                My Bookmarks
                <div className="px-3 py-1 bg-primary-50 rounded-full text-primary-600 text-sm font-bold">
                  {bookmarkedIds.length}
                </div>
              </h1>
              <p className="text-neutral-500 text-lg font-medium">
                Your curated list of impactful projects to support.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search your saved projects..." 
                  className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-[1280px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
            <p className="text-neutral-500 font-bold animate-pulse">Retrieving your saved impacts...</p>
          </div>
        ) : bookmarkedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {bookmarkedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-neutral-200 shadow-sm">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-8 text-primary-500">
              <Bookmark className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4 text-center">
              Your collection is empty
            </h2>
            <p className="text-neutral-500 text-center max-w-md mb-10 text-lg leading-relaxed">
              Start exploring projects and bookmark the ones that inspire you. They&apos;ll appear here for easy access.
            </p>
            <Link href="/projects">
              <Button size="lg" className="rounded-xl px-10 shadow-stellar hover:shadow-stellar-lg transition-all">
                Explore Projects
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Stats/Footer area */}
      {bookmarkedProjects.length > 0 && (
        <div className="container mx-auto px-4 pb-24 max-w-[1280px]">
           <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-stellar-lg">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to make a difference?</h3>
                <p className="text-primary-100 font-medium">You have {bookmarkedProjects.length} projects waiting for your support.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary-400 flex items-center justify-center text-xs font-bold">
                        U{i}
                     </div>
                   ))}
                </div>
                <span className="text-sm font-bold text-primary-50">Join 2.4k+ other donors</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
