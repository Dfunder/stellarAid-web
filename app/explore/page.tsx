"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  Star,
  TrendingUp,
  Zap,
  Heart,
  Users,
} from "lucide-react";

import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Dynamic imports for heavy components to reduce initial bundle size (#142)
const ProjectCard = dynamic(() => import("@/components/projects/ProjectCard"), {
  loading: () => <ProjectCardSkeleton />,
});

const ProjectFilters = dynamic(
  () =>
    import("@/components/projects/ProjectFilters").then(
      (m) => ({ default: m.ProjectFilters }),
    ),
  { ssr: false },
);

const ProjectSearch = dynamic(
  () => import("@/components/projects/ProjectSearch"),
  { ssr: false },
);

import type {
  ProjectFiltersState,
  SortOption,
} from "@/components/projects/ProjectFilters";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination, type PageSize } from "@/components/ui/Pagination";

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

// Total mock items (simulates a real API total count)
const TOTAL_MOCK_ITEMS = 120;

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── URL-driven pagination state (#146) ──────────────────────────────────────
  const pageParam = Number(searchParams.get("page") ?? "1");
  const sizeParam = Number(searchParams.get("size") ?? "12") as PageSize;
  const validSizes: PageSize[] = [12, 24, 48];
  const currentPage = Math.max(1, pageParam);
  const pageSize: PageSize = validSizes.includes(sizeParam) ? sizeParam : 12;

  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProjectFiltersState>({
    sort: "newest",
    verifiedOnly: false,
    status: "all",
    urgentOnly: false,
  });

  /** Push updated page/size to URL without full navigation */
  const updateUrl = useCallback(
    (page: number, size: PageSize) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      params.set("size", String(size));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

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
      const category = categories[index % categories.length] ?? "Community";
      const imageGradient = gradients[index % gradients.length] ?? gradients[0] ?? "from-blue-400 to-purple-600";
      const status = statuses[Math.floor(Math.random() * statuses.length)] ?? "active";

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

  // Fetch one page of projects
  const fetchProjects = useCallback(
    async (page: number, size: number) => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        const newProjects = Array.from({ length: size }, (_, i) =>
          generateMockProject(`project-${page}-${i}`, (page - 1) * size + i),
        );

        setProjects(newProjects);
      } catch {
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [generateMockProject],
  );

  // Fetch featured projects (once)
  const fetchFeaturedProjects = useCallback(async () => {
    try {
      const featured = Array.from({ length: 3 }, (_, i) =>
        generateMockProject(`featured-${i}`, i),
      ).map((project) => ({ ...project, featured: true }));
      setFeaturedProjects(featured);
    } catch {
      console.error("Failed to fetch featured projects");
    }
  }, [generateMockProject]);

  // Re-fetch whenever page or pageSize changes
  useEffect(() => {
    fetchProjects(currentPage, pageSize);
  }, [fetchProjects, currentPage, pageSize]);

  useEffect(() => {
    fetchFeaturedProjects();
  }, [fetchFeaturedProjects]);

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateUrl(1, pageSize);
    },
    [updateUrl, pageSize],
  );

  // Handle filters change
  const handleFiltersChange = useCallback(
    (newFilters: ProjectFiltersState) => {
      setFilters(newFilters);
      updateUrl(1, pageSize);
    },
    [updateUrl, pageSize],
  );

  // Filter and sort projects (client-side within the current page)
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description &&
            project.description.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((project) => project.status === filters.status);
    }
    if (filters.verifiedOnly) {
      filtered = filtered.filter((project) => project.isVerified);
    }
    if (filters.urgentOnly) {
      filtered = filtered.filter((project) => project.isUrgent);
    }

    filtered.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
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
  }, [projects, searchQuery, filters]);

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
                  {TOTAL_MOCK_ITEMS}
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
        {featuredProjects.length > 0 &&
          !searchQuery &&
          filters.status === "all" &&
          currentPage === 1 && (
            <FeaturedSection projects={featuredProjects} />
          )}

        {/* All Projects */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {searchQuery
                ? `Search Results (${filteredProjects.length})`
                : "All Campaigns"}
            </h2>
            {filteredProjects.length > 0 && (
              <span className="text-sm text-neutral-500">
                Page {currentPage} · {filteredProjects.length} shown
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: pageSize }, (_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card variant="elevated" className="p-8 text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-neutral-600 mb-4">{error}</p>
              <Button onClick={() => fetchProjects(currentPage, pageSize)}>
                Try Again
              </Button>
            </Card>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <>
              {filteredProjects.length === 0 ? (
                <EmptyState searchQuery={searchQuery} filters={filters} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination controls (#146) */}
          {!loading && !error && filteredProjects.length > 0 && (
            <div className="mt-10">
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={TOTAL_MOCK_ITEMS}
                onPageChange={(p) => {
                  updateUrl(p, pageSize);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSizeChange={(s) => updateUrl(1, s)}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
