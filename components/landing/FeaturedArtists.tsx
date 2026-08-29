'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Sparkles, User, AlertCircle } from 'lucide-react';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import api from '@/app/services/api';

export interface FeaturedArtist {
  id: string;
  name: string;
  avatar: string;
  topSkill: string;
  rating: number;
  reviewCount?: number;
  profileUrl?: string;
  verified?: boolean;
}

// 6 fallback mock artists for development/fallback when API is unavailable
const MOCK_FEATURED_ARTISTS: FeaturedArtist[] = [
  {
    id: '1',
    name: 'Elena Rostova',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    topSkill: '3D Character Art',
    rating: 4.9,
    reviewCount: 142,
    profileUrl: '/artists/elena-rostova',
  },
  {
    id: '2',
    name: 'Marcus Vance',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    topSkill: 'Digital Illustration',
    rating: 4.85,
    reviewCount: 98,
    profileUrl: '/artists/marcus-vance',
  },
  {
    id: '3',
    name: 'Aria Takahashi',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    topSkill: 'Motion Design',
    rating: 4.95,
    reviewCount: 215,
    profileUrl: '/artists/aria-takahashi',
  },
  {
    id: '4',
    name: 'Devon Thorne',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    topSkill: 'Generative AI Art',
    rating: 4.78,
    reviewCount: 76,
    profileUrl: '/artists/devon-thorne',
  },
  {
    id: '5',
    name: 'Sophia Chen',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    topSkill: 'UI & Environment',
    rating: 4.92,
    reviewCount: 184,
    profileUrl: '/artists/sophia-chen',
  },
  {
    id: '6',
    name: 'Kaelen Voss',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    topSkill: 'Concept Architecture',
    rating: 4.88,
    reviewCount: 110,
    profileUrl: '/artists/kaelen-voss',
  },
];

export default function FeaturedArtists() {
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchFeaturedArtists() {
      try {
        setLoading(true);
        setError(null);

        // Attempt to fetch from API endpoint GET /marketplace/featured
        const response = await api.get('/marketplace/featured');

        if (isMounted) {
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Map API response fields safely
            const mappedData: FeaturedArtist[] = response.data
              .slice(0, 6)
              .map((item: any, idx: number) => ({
                id: String(item.id || item._id || idx + 1),
                name: item.name || item.fullName || item.artistName || `Artist ${idx + 1}`,
                avatar:
                  item.avatar ||
                  item.profileImage ||
                  item.image ||
                  MOCK_FEATURED_ARTISTS[idx % MOCK_FEATURED_ARTISTS.length]!.avatar,
                topSkill:
                  item.topSkill ||
                  item.skillTag ||
                  item.category ||
                  item.specialty ||
                  'Digital Creator',
                rating: typeof item.rating === 'number' ? item.rating : 4.9,
                reviewCount:
                  item.reviewCount || item.totalReviews || Math.floor(Math.random() * 100) + 50,
                profileUrl: item.profileUrl || `/artists/${item.id || item._id || idx + 1}`,
              }));
            setArtists(mappedData);
          } else {
            // Fallback to 6 mock artists if API returns empty array or different structure
            setArtists(MOCK_FEATURED_ARTISTS);
          }
        }
      } catch (err: any) {
        console.warn(
          'API GET /marketplace/featured unreachable or error, falling back to mock featured artists:',
          err?.message
        );
        if (isMounted) {
          // Use mock data gracefully on error
          setArtists(MOCK_FEATURED_ARTISTS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFeaturedArtists();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-neutral-900/50 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spotlight Creators</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Featured Artists
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-base max-w-2xl">
              Discover top creative talents using Web3 and Stellar blockchain to craft impactful
              digital artwork.
            </p>
          </div>

          <Link
            href="/artists"
            className="inline-flex items-center gap-2 font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors group text-sm self-start md:self-auto"
          >
            <span>Explore All Artists</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-6 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center flex-shrink-0 bg-white dark:bg-neutral-800/80 rounded-2xl p-6 border border-neutral-200/80 dark:border-neutral-700/80 animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-1/3 mb-6" />
                </div>
                <div className="h-11 bg-neutral-200 dark:bg-neutral-700 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Artist Cards Container (Horizontal Scroll on Mobile, 3-Col Grid on Desktop) */}
        {!loading && artists.length > 0 && (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-6 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center flex-shrink-0 bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header Row: Avatar & Rating */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-700 border-2 border-primary-100 dark:border-neutral-600 flex-shrink-0 shadow-inner">
                      {imgErrors[artist.id] ? (
                        <div className="w-full h-full flex items-center justify-center bg-primary-700 text-white font-bold text-xl">
                          {artist.name.charAt(0)}
                        </div>
                      ) : (
                        <Image
                          src={artist.avatar}
                          alt={artist.name}
                          fill
                          sizes="64px"
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => handleImageError(artist.id)}
                        />
                      )}
                    </div>

                    {/* Rating Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{artist.rating.toFixed(1)}</span>
                      {artist.reviewCount !== undefined && (
                        <span className="text-amber-600/70 dark:text-amber-400/60 font-normal">
                          ({artist.reviewCount})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Artist Info */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {artist.name}
                      </h3>
                      {artist.verified && <VerifiedBadge size="sm" />}
                    </div>

                    {/* Top Skill Tag */}
                    <div className="mt-2.5 inline-block px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200/60 dark:border-neutral-600/50">
                      {artist.topSkill}
                    </div>
                  </div>
                </div>

                {/* Footer Action: View Profile Link */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700/50">
                  <Link
                    href={artist.profileUrl || `/artists/${artist.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm hover:bg-primary-700 dark:hover:bg-primary-400 dark:hover:text-neutral-950 transition-colors duration-200 shadow-sm"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
