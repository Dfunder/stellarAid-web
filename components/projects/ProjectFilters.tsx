'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Check, 
  X, 
  Filter, 
  BadgeCheck,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type SortOption = 'newest' | 'most-funded' | 'ending-soon' | 'popular';
export type FundingStatus = 'all' | 'active' | 'almost-funded' | 'completed';

export interface ProjectFiltersState {
  sort: SortOption;
  verifiedOnly: boolean;
  status: FundingStatus;
  urgentOnly: boolean;
}

interface ProjectFiltersProps {
  onFiltersChange?: (filters: ProjectFiltersState) => void;
  className?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'most-funded', label: 'Most Funded', icon: Zap },
  { value: 'ending-soon', label: 'Ending Soon', icon: Clock },
  { value: 'popular', label: 'Popular', icon: Zap },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active', icon: Zap },
  { value: 'almost-funded', label: 'Almost Funded', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  onFiltersChange,
  className 
}) => {
  const [filters, setFilters] = useState<ProjectFiltersState>({
    sort: 'newest',
    verifiedOnly: false,
    status: 'all',
    urgentOnly: false,
  });

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilters = (newFilters: Partial<ProjectFiltersState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange?.(updated);
  };

  const clearAll = () => {
    const reset = {
      sort: 'newest',
      verifiedOnly: false,
      status: 'all',
      urgentOnly: false,
    };
    setFilters(reset);
    onFiltersChange?.(reset);
  };

  const activeFiltersCount = [
    filters.verifiedOnly,
    filters.urgentOnly,
    filters.status !== 'all'
  ].filter(Boolean).length;

  return (
    <div className={twMerge("sticky top-0 z-30 w-full bg-[#f0f4fa]/95 backdrop-blur-md border-b border-neutral-200 py-4 transition-all duration-300", className)}>
      <div className="container mx-auto px-4 max-w-[1280px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:border-primary-400 hover:shadow-stellar-sm transition-all duration-200"
              >
                <Filter className="w-4 h-4 text-neutral-400" />
                <span>Sort by: <span className="text-neutral-900">{sortOptions.find(o => o.value === filters.sort)?.label}</span></span>
                <ChevronDown className={clsx("w-4 h-4 text-neutral-400 transition-transform duration-200", isSortOpen && "rotate-180")} />
              </button>

              {isSortOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-stellar-lg overflow-hidden animate-fade-in z-50">
                  <div className="p-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFilters({ sort: option.value as SortOption });
                          setIsSortOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <option.icon className="w-4 h-4 opacity-50" />
                          {option.label}
                        </div>
                        {filters.sort === option.value && <Check className="w-4 h-4 text-primary-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:border-primary-400 hover:shadow-stellar-sm transition-all duration-200"
              >
                <Zap className="w-4 h-4 text-neutral-400" />
                <span>Status: <span className="text-neutral-900">{statusOptions.find(o => o.value === filters.status)?.label}</span></span>
                <ChevronDown className={clsx("w-4 h-4 text-neutral-400 transition-transform duration-200", isStatusOpen && "rotate-180")} />
              </button>

              {isStatusOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-stellar-lg overflow-hidden animate-fade-in z-50">
                  <div className="p-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFilters({ status: option.value as FundingStatus });
                          setIsStatusOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 rounded-lg transition-colors"
                      >
                        <span>{option.label}</span>
                        {filters.status === option.value && <Check className="w-4 h-4 text-primary-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-neutral-200 mx-1 hidden md:block" />

            {/* Verified Toggle */}
            <button
              onClick={() => updateFilters({ verifiedOnly: !filters.verifiedOnly })}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                filters.verifiedOnly 
                  ? "bg-primary-50 border-primary-200 text-primary-700 shadow-stellar-sm" 
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
              )}
            >
              <BadgeCheck className={clsx("w-4 h-4", filters.verifiedOnly ? "text-primary-500" : "text-neutral-400")} />
              Verified
            </button>

            {/* Urgent Toggle */}
            <button
              onClick={() => updateFilters({ urgentOnly: !filters.urgentOnly })}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                filters.urgentOnly 
                  ? "bg-secondary-50 border-secondary-200 text-secondary-700 shadow-stellar-sm" 
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
              )}
            >
              <Zap className={clsx("w-4 h-4", filters.urgentOnly ? "text-secondary-500" : "text-neutral-400")} />
              Urgent
            </button>
          </div>

          {/* Clear Actions */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{activeFiltersCount} Active Filters</span>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
            {filters.status !== 'all' && (
              <Badge 
                label={`Status: ${statusOptions.find(o => o.value === filters.status)?.label}`} 
                onRemove={() => updateFilters({ status: 'all' })} 
              />
            )}
            {filters.verifiedOnly && (
              <Badge 
                label="Verified Only" 
                onRemove={() => updateFilters({ verifiedOnly: false })} 
              />
            )}
            {filters.urgentOnly && (
              <Badge 
                label="Urgent Projects" 
                onRemove={() => updateFilters({ urgentOnly: false })} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Badge = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-700 shadow-sm">
    {label}
    <button 
      onClick={onRemove}
      className="p-0.5 hover:bg-neutral-100 rounded-full transition-colors"
    >
      <X className="w-3 h-3 text-neutral-400" />
    </button>
  </span>
);
