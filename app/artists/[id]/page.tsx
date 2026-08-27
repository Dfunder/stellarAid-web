'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useArtist } from '@/hooks/useArtist';
import api from '@/app/services/api';
import PortfolioTab from './components/PortfolioTab';
import ServicesTab from './components/ServicesTab';
import ReviewsTab from './components/ReviewsTab';
import Button from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import {
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  MessageSquare,
  Image as ImageIcon,
  Mail,
  Sparkles,
} from 'lucide-react';
import type { Artist } from '@/app/features/artists/artistsSlice';

type TabKey = 'portfolio' | 'services' | 'reviews';

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;
  const { data: artist, isLoading: loading, error } = useArtist(artistId);
  const [activeTab, setActiveTab] = useState<TabKey>('portfolio');

  // Fetch all artists to find similar ones based on matching skills
  const { data: allArtists, isLoading: similarArtistsLoading } = useQuery<Artist[]>({
    queryKey: ['allArtists'],
    queryFn: async () => {
      const { data } = await api.get('/artists');
      return data;
    },
    enabled: !!artist, // Only fetch when we have the current artist's data
  });

  // Filter similar artists - exclude current artist and sort by number of matching skills
  const similarArtists = allArtists
    ?.filter(a => a.id !== artistId) // Exclude current artist
    .map(otherArtist => {
      // Calculate how many skills match with current artist
      const matchingSkills = otherArtist.skills.filter(skill => 
        artist?.skills?.includes(skill)
      ).length;
      return { ...otherArtist, matchingSkills };
    })
    .filter(a => a.matchingSkills > 0) // Only include artists with at least one matching skill
    .sort((a, b) => b.matchingSkills - a.matchingSkills) // Sort by most matching skills
    .slice(0, 4) as (Artist & { matchingSkills: number })[]; // Show top 4 similar artists

  if (loading && !artist) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-900" />
          <div className="mt-4 space-y-3 max-w-lg">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-neutral-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Artist Not Found
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : "We couldn't find the artist you're looking for."}
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'services', label: 'Services', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Cover Image */}
      <div className="relative h-56 sm:h-72 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600">
        {artist.coverImage && (
          <img
            src={artist.coverImage}
            alt={`${artist.name} cover`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-neutral-200 dark:bg-neutral-700 shadow-lg flex-shrink-0">
            {artist.avatar ? (
              <NextImage
              <Image
                src={artist.avatar}
                alt={artist.name}
                fill
                className="object-cover"
                sizes="144px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {artist.name}
              </h1>
              {artist.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            {artist.tagline && (
              <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-lg">
                {artist.tagline}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {artist.rating?.toFixed(1) || '—'}
                </span>
                <span className="text-sm text-neutral-400">
                  ({artist.reviewCount || 0} reviews)
                </span>
              </div>
              {artist.walletAddress && (
                <span className="text-sm text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Stellar Wallet Connected
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2 sm:pb-2 mt-3 sm:mt-0">
            <Button variant="primary" size="md">
              <Mail className="w-4 h-4 mr-2" />
              Hire Me
            </Button>
            <Link
              href={`/commissions/new?artistId=${artist.id}&artistName=${encodeURIComponent(artist.name)}`}
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary-700 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              Commission
            </Link>
          </div>
        </div>

        {/* Skills Tags */}
        {artist.skills && artist.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {artist.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {artist.bio && (
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
            {artist.bio}
          </p>
        )}

        {/* Tabs Navigation */}
        <div className="mt-8 border-b border-neutral-200 dark:border-neutral-800">
          <nav className="flex gap-0 -mb-px" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'portfolio' && <PortfolioTab artistId={artistId} />}
          {activeTab === 'services' && <ServicesTab artistId={artistId} />}
          {activeTab === 'reviews' && <ReviewsTab artistId={artistId} />}
        </div>

        {/* You might also like - Similar Artists Section */}
        {similarArtists && similarArtists.length > 0 && (
          <div className="mt-12 pb-16">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">You might also like</h2>
            </div>
            
            {similarArtistsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarArtists.map(similarArtist => (
                  <Link
                    key={similarArtist.id}
                    href={`/artists/${similarArtist.id}`}
                    className="group bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="relative h-40 bg-gradient-to-r from-primary-600/20 to-secondary-600/20">
                      {similarArtist.coverImage && (
                        <img
                          src={similarArtist.coverImage}
                          alt={`${similarArtist.name} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-4 -mt-10 relative">
                      <div className="relative w-16 h-16 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-neutral-200 dark:bg-neutral-700 mb-3">
                        {similarArtist.avatar ? (
                          <NextImage
                            src={similarArtist.avatar}
                            alt={similarArtist.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {similarArtist.name}
                        </h3>
                        {similarArtist.verified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-1">
                        {similarArtist.tagline || similarArtist.skills?.[0] || 'Digital Creator'}
                      </p>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {similarArtist.rating?.toFixed(1) || '—'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          ({similarArtist.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}