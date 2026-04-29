"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Star,
  TrendingUp,
  Clock,
  Zap,
  Heart,
  Users,
} from "lucide-react";

import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/types/api";
import ProjectCard from "@/components/projects/ProjectCard";
import {
  ProjectFilters,
  ProjectFiltersState,
  SortOption,
} from "@/components/projects/ProjectFilters";
import ProjectSearch from "@/components/projects/ProjectSearch";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Types
interface ProjectWithMetadata {
  id: string;
  title: string;
  category: string;
  imageGradient?: string;
  isVerified?: boolean;
  isUrgent?: boolean;
  status?: "active" | "completed" | "almost-funded";
  progress?: number;
  currentAmount?: number;
  targetAmount?: number;
  raised?: number;
  goal?: number;
  imageUrl?: string;
  daysLeft?: number;
  backers?: number;
  featured?: boolean;
  description?: string;
  creatorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExplorePageState {
  projects: ProjectWithMetadata[];
  featuredProjects: ProjectWithMetadata[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  searchQuery: string;
  filters: ProjectFiltersState;
}

// Loading skeleton component
const ProjectCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 animate-pulse">
    <div className="h-56 bg-gradient-to-br from-neutral-100 to-neutral-200" />
    <div className="p-7">
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 w-16 bg-neutral-200 rounded" />
        <div className="h-6 w-20 bg-neutral-200 rounded-md" />
      </div>
      <div className="h-6 bg-neutral-200 rounded mb-6" />
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <div className="h-4 w-12 bg-neutral-200 rounded" />
            <div className="h-4 w-8 bg-neutral-200 rounded" />
          </div>
          <div className="h-2 bg-neutral-200 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 w-24 bg-neutral-200 rounded" />
          <div className="h-10 w-20 bg-neutral-200 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({
  searchQuery,
  filters,
}: {
  searchQuery: string;
  filters: ProjectFiltersState;
}) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Search className="w-12 h-12 text-neutral-400" />
    </div>
    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
      No projects found
    </h3>
    <p className="text-neutral-600 max-w-md mx-auto">
      {searchQuery
        ? `No projects match "${searchQuery}". Try adjusting your search terms or filters.`
        : "No projects match your current filters. Try adjusting your filter settings."}
    </p>
    <div className="mt-6">
      <Button variant="secondary" onClick={() => window.location.reload()}>
        Clear Filters
      </Button>
    </div>
  </div>
);

// Featured projects section
const FeaturedSection = ({ projects }: { projects: ProjectWithMetadata[] }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <Star className="w-6 h-6 text-primary-500" />
      <h2 className="text-2xl font-bold text-neutral-900">
        Featured Campaigns
      </h2>
      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
        {projects.length} Featured
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="relative">
          <div className="absolute -top-2 -right-2 z-10">
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-xs font-bold shadow-lg">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          </div>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  </section>
);

export default function ExplorePage() {
  const [state, setState] = useState<ExplorePageState>({
    projects: [],
    featuredProjects: [],
    loading: true,
    loadingMore: false,
    error: null,
    currentPage: 1,
    hasMore: true,
    searchQuery: "",
    filters: {
      sort: "newest",
      verifiedOnly: false,
      status: "all",
      urgentOnly: false,
    },
  });

  // Mock data generator for demonstration
  const generateMockProject = useCallback(
    (id: string, index: number): ProjectWithMetadata => {
      const categories = [
        "Education",
        "Healthcare",
        "Environment",
        "Technology",
        "Arts",
        "Community",
      ];
      const statuses: Array<"active" | "completed" | "almost-funded"> = [
        "active",
        "active",
        "active",
        "almost-funded",
        "completed",
      ];
      const gradients = [
        "from-blue-400 to-purple-600",
        "from-green-400 to-blue-500",
        "from-purple-400 to-pink-600",
        "from-yellow-400 to-orange-500",
        "from-pink-400 to-red-500",
        "from-indigo-400 to-purple-500",
      ];

      const target = Math.floor(Math.random() * 50000) + 10000;
      const current = Math.floor(Math.random() * target);
      const progress = Math.round((current / target) * 100);
      const category = categories[index % categories.length] ?? 'Community';
      const imageGradient = gradients[index % gradients.length] ?? gradients[0] ?? 'from-blue-400 to-purple-600';
      const status = statuses[Math.floor(Math.random() * statuses.length)] ?? 'active';

      return {
        id,
        title: `Project ${index + 1}: ${category} Initiative`,
        description: `A meaningful project working towards positive change in the ${category} sector. Join us in making a difference.`,
        targetAmount: target,
        currentAmount: current,
        creatorId: `creator-${index}`,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
        category,
        imageGradient,
        isVerified: Math.random() > 0.5,
        isUrgent: Math.random() > 0.7,
        status,
        progress,
        raised: current,
        goal: target,
        daysLeft: Math.floor(Math.random() * 30) + 1,
        backers: Math.floor(Math.random() * 500) + 10,
        featured: index < 3,
      };
    },
    [],
  );

  // Fetch projects
  const fetchProjects = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: reset,
          loadingMore: !reset && page > 1,
          error: null,
        }));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate mock data for demonstration
        const newProjects = Array.from({ length: 9 }, (_, i) =>
          generateMockProject(`project-${page}-${i}`, (page - 1) * 9 + i),
        );

        setState((prev) => {
          const projects = reset
            ? newProjects
            : [...prev.projects, ...newProjects];
          return {
            ...prev,
            projects,
            loading: false,
            loadingMore: false,
            currentPage: page,
            hasMore: page < 5, // Simulate 5 pages of data
          };
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: "Failed to load projects. Please try again.",
        }));
      }
    },
    [generateMockProject],
  );

  // Fetch featured projects
  const fetchFeaturedProjects = useCallback(async () => {
    try {
      // Generate featured projects (first 3 with featured flag)
      const featured = Array.from({ length: 3 }, (_, i) =>
        generateMockProject(`featured-${i}`, i),
      ).map((project) => ({ ...project, featured: true }));

      setState((prev) => ({ ...prev, featuredProjects: featured }));
    } catch (err) {
      console.error("Failed to fetch featured projects:", err);
    }
  }, [generateMockProject]);

  // Initial load
  useEffect(() => {
    fetchProjects(1, true);
    fetchFeaturedProjects();
  }, [fetchProjects, fetchFeaturedProjects]);

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setState((prev) => ({ ...prev, searchQuery: query, currentPage: 1 }));
      fetchProjects(1, true);
    },
    [fetchProjects],
  );

  // Handle filters change
  const handleFiltersChange = useCallback(
    (filters: ProjectFiltersState) => {
      setState((prev) => ({ ...prev, filters, currentPage: 1 }));
      fetchProjects(1, true);
    },
    [fetchProjects],
  );

  // Load more projects
  const loadMore = useCallback(() => {
    if (!state.loadingMore && state.hasMore) {
      fetchProjects(state.currentPage + 1, false);
    }
  }, [state.loadingMore, state.hasMore, state.currentPage, fetchProjects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = state.projects;

    // Apply search filter
    if (state.searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          (project.description &&
            project.description
              .toLowerCase()
              .includes(state.searchQuery.toLowerCase())),
      );
    }

    // Apply status filter
    if (state.filters.status !== "all") {
      filtered = filtered.filter(
        (project) => project.status === state.filters.status,
      );
    }

    // Apply verified filter
    if (state.filters.verifiedOnly) {
      filtered = filtered.filter((project) => project.isVerified);
    }

    // Apply urgent filter
    if (state.filters.urgentOnly) {
      filtered = filtered.filter((project) => project.isUrgent);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.filters.sort) {
        case "newest":
          return (
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
          );
        case "most-funded":
          return (b.raised || 0) - (a.raised || 0);
        case "ending-soon":
          return (a.daysLeft || 0) - (b.daysLeft || 0);
        case "popular":
          return (b.backers || 0) - (a.backers || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.projects, state.searchQuery, state.filters]);

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 max-w-[1280px] py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-3">
              Explore Campaigns
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover and support meaningful projects making a difference in
              communities around the world.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <ProjectSearch
              onSearch={handleSearch}
              placeholder="Search campaigns by title, category, or description..."
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <span className="text-2xl font-bold text-neutral-900">
                  {filteredProjects.length}
                </span>
              </div>
              <span className="text-sm text-neutral-600">Active Campaigns</span>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-secondary-500" />
                <span className="text-2xl font-bold text-neutral-900">
                  {filteredProjects
                    .reduce((sum, p) => sum + (p.backers || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              <span className="text-sm text-neutral-600">Total Backers</span>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-danger-500" />
                <span className="text-2xl font-bold text-neutral-900">
                  {filteredProjects.filter((p) => p.isVerified).length}
                </span>
              </div>
              <span className="text-sm text-neutral-600">Verified</span>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-warning-500" />
                <span className="text-2xl font-bold text-neutral-900">
                  {filteredProjects.filter((p) => p.isUrgent).length}
                </span>
              </div>
              <span className="text-sm text-neutral-600">Urgent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ProjectFilters onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-[1280px] py-8">
        {/* Featured Projects */}
        {state.featuredProjects.length > 0 &&
          !state.searchQuery &&
          state.filters.status === "all" && (
            <FeaturedSection projects={state.featuredProjects} />
          )}

        {/* All Projects */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {state.searchQuery
                ? `Search Results (${filteredProjects.length})`
                : "All Campaigns"}
            </h2>
            {filteredProjects.length > 0 && (
              <span className="text-sm text-neutral-500">
                Showing {filteredProjects.length} campaign
                {filteredProjects.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Loading State */}
          {state.loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }, (_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {state.error && (
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-neutral-600 mb-4">{state.error}</p>
              <Button onClick={() => fetchProjects(1, true)}>Try Again</Button>
            </Card>
          )}

          {/* Projects Grid */}
          {!state.loading && !state.error && (
            <>
              {filteredProjects.length === 0 ? (
                <EmptyState
                  searchQuery={state.searchQuery}
                  filters={state.filters}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Load More */}
          {!state.loading &&
            !state.error &&
            filteredProjects.length > 0 &&
            state.hasMore && (
              <div className="text-center mt-12">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={loadMore}
                  isLoading={state.loadingMore}
                  disabled={state.loadingMore}
                >
                  {state.loadingMore ? "Loading..." : "Load More Campaigns"}
                </Button>
              </div>
            )}

          {/* End of Results */}
          {!state.loading &&
            !state.error &&
            filteredProjects.length > 0 &&
            !state.hasMore && (
              <div className="text-center mt-12 py-8 border-t border-neutral-200">
                <p className="text-neutral-500">
                  You&apos;ve reached the end of the campaign list.
                </p>
              </div>
            )}
        </section>
      </div>
    </div>
  );
}
