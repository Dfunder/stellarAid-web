'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import {
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  MessageSquare,
  Image as ImageIcon,
  Mail,
  Users,
} from 'lucide-react';

type TabKey = 'portfolio' | 'teams' | 'services' | 'reviews';

export default function AgencyProfilePage() {
  const params = useParams();
  const agencyId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabKey>('portfolio');

  // Mock data for demonstration
  const agency = {
    id: agencyId,
    name: 'Creative Minds Agency',
    tagline: 'A team of talented designers and developers',
    verified: true,
    rating: 4.8,
    reviewCount: 24,
    walletAddress: 'GABC...123',
    bio: 'We are a full-service creative agency specializing in design, development, and digital marketing. Our team of 15+ professionals delivers high-quality work for clients worldwide.',
    avatar: '',
    coverImage: '',
    teams: [
      {
        id: 'team-1',
        name: 'Design Team',
        description: 'UI/UX and graphic design specialists',
        members: [
          { id: 'u1', name: 'Sarah Johnson', role: 'Lead Designer', avatar: '', rating: 4.9 },
          { id: 'u2', name: 'Mike Chen', role: 'UI Designer', avatar: '', rating: 4.7 },
          { id: 'u3', name: 'Emma Wilson', role: 'Illustrator', avatar: '', rating: 4.8 },
        ],
      },
      {
        id: 'team-2',
        name: 'Development Team',
        description: 'Full-stack developers and engineers',
        members: [
          { id: 'u4', name: 'David Lee', role: 'Tech Lead', avatar: '', rating: 4.9 },
          { id: 'u5', name: 'Lisa Wang', role: 'Frontend Developer', avatar: '', rating: 4.6 },
        ],
      },
    ],
    portfoliosByTeam: {
      'team-1': [
        { id: 'p1', title: 'Brand Identity Package', coverImage: '', items: 12, description: 'Complete brand redesign for a tech startup', teamName: 'Design Team' },
        { id: 'p2', title: 'Mobile App UI Design', coverImage: '', items: 8, description: 'UI/UX design for fitness tracking app', teamName: 'Design Team' },
      ],
      'team-2': [
        { id: 'p3', title: 'E-commerce Platform', coverImage: '', items: 15, description: 'Full-stack e-commerce solution', teamName: 'Development Team' },
      ],
    },
    totalEarnings: 125000,
    teamEarnings: {
      'team-1': 75000,
      'team-2': 50000,
    },
  };

  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-neutral-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Agency Not Found
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            We couldn't find the agency you're looking for.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
    { key: 'services', label: 'Services', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const allPortfolios = Object.values(agency.portfoliosByTeam).flat();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Cover Image */}
      <div className="relative h-56 sm:h-72 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600">
        {agency.coverImage && (
          <img
            src={agency.coverImage}
            alt={`${agency.name} cover`}
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
            {agency.avatar ? (
              <NextImage
                src={agency.avatar}
                alt={agency.name}
                fill
                className="object-cover"
                sizes="144px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <Building2 className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {agency.name}
                <span className="ml-2 text-sm px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                  Agency
                </span>
              </h1>
              {agency.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            {agency.tagline && (
              <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-lg">
                {agency.tagline}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {agency.rating?.toFixed(1) || '—'}
                </span>
                <span className="text-sm text-neutral-400">
                  ({agency.reviewCount || 0} reviews)
                </span>
              </div>
              <span className="text-sm text-neutral-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {agency.teams.reduce((acc, team) => acc + team.members.length, 0)} team members
              </span>
              {agency.walletAddress && (
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
              Contact Agency
            </Button>
            <Link
              href={`/commissions/new?agencyId=${agency.id}&agencyName=${encodeURIComponent(agency.name)}`}
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary-700 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              Start a Project
            </Link>
          </div>
        </div>

        {/* Teams Count Badge */}
        <div className="flex flex-wrap gap-2 mt-5">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">
            {agency.teams.length} teams
          </span>
          {agency.teams.map((team) => (
            <span
              key={team.id}
              className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium rounded-full"
            >
              {team.name}: {team.members.length} members
            </span>
          ))}
        </div>

        {/* Bio */}
        {agency.bio && (
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
            {agency.bio}
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
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
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
          {activeTab === 'portfolio' && (
            <PortfolioTab portfoliosByTeam={agency.portfoliosByTeam} />
          )}
          {activeTab === 'teams' && (
            <TeamsTab teams={agency.teams} teamEarnings={agency.teamEarnings} />
          )}
          {activeTab === 'services' && (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Services coming soon
              </h3>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Reviews & Ratings
              </h3>
              <p className="text-neutral-500">Team ratings and client reviews will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PortfolioTab({ portfoliosByTeam }: { portfoliosByTeam: any }) {
  return (
    <div className="space-y-12">
      {Object.entries(portfoliosByTeam).map(([teamId, portfolios]: [string, any[]]) => (
        <div key={teamId} className="border-b border-neutral-200 dark:border-neutral-800 pb-10 last:border-0">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-500" />
            {portfolios[0]?.teamName || 'Team'} Portfolio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio: any) => (
              <Link
                key={portfolio.id}
                href={`/portfolios/${portfolio.id}`}
                className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  {portfolio.coverImage ? (
                    <img
                      src={portfolio.coverImage}
                      alt={portfolio.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-xs font-medium text-neutral-600 dark:text-neutral-300 rounded-full">
                      {portfolio.items?.length || 0} items
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {portfolio.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {portfolio.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamsTab({ teams, teamEarnings }: { teams: any[], teamEarnings: any }) {
  return (
    <div className="space-y-8">
      {teams.map((team) => (
        <div key={team.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{team.name}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">{team.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Team Earnings</p>
              <p className="text-2xl font-bold text-emerald-600">${teamEarnings[team.id]?.toLocaleString() || 0}</p>
            </div>
          </div>
          
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Team Members ({team.members.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member: any) => (
              <Link
                key={member.id}
                href={`/artists/${member.id}`}
                className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white truncate">{member.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{member.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-current text-amber-500" />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{member.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}