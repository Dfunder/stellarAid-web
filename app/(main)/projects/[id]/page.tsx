import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ProjectDetailsClient } from '@/components/projects/ProjectDetailsClient';
import type { Project, ProjectCreator, ProjectStatus, Update } from '@/types/api';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await fetchProject(params.id);

  if (!project) {
    return {
      title: 'Project Not Found | StellarAid',
      description: 'The requested project could not be found.',
    };
  }

  const title = `${project.title} | StellarAid`;
  const description = project.description?.substring(0, 160) || `Support this ${project.category} project on StellarAid.`;
  const imageUrl = project.imageUrl || '/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/projects/${params.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Project',
        name: project.title,
        description: project.description,
        image: project.imageUrl,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://stellaraid.com'}/projects/${params.id}`,
        creator: {
          '@type': 'Person',
          name: project.creator?.name || 'StellarAid Creator',
        },
        provider: {
          '@type': 'Organization',
          name: 'StellarAid',
        },
        funding: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: project.currentAmount,
        },
        goal: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: project.targetAmount,
        },
      }),
    },
  };
}

type ProjectApiPayload = Partial<Project> & {
  raised?: string | number;
  goal?: string | number;
  fundingGoal?: string | number;
  target?: string | number;
  images?: string[];
  creatorName?: string;
  creator?: ProjectCreator;
  updates?: Update[];
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80',
];

const CATEGORIES = ['Environment', 'Health', 'Education', 'Disaster Relief', 'Energy', 'Community'];

function toStringAmount(value: string | number | undefined, fallback = '0') {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return fallback;
}

function toNumber(value: string | number | undefined, fallback = 0) {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toStatus(value: unknown): ProjectStatus {
  if (value === 'completed' || value === 'almost-funded' || value === 'paused' || value === 'draft') {
    return value;
  }

  return 'active';
}

function normalizeProject(payload: ProjectApiPayload, id: string): Project {
  const targetAmount = toStringAmount(payload.targetAmount ?? payload.goal ?? payload.fundingGoal ?? payload.target, '50000');
  const currentAmount = toStringAmount(payload.currentAmount ?? payload.raised, '0');
  const createdAt = payload.createdAt || new Date().toISOString();
  const imageUrls = payload.imageUrls?.length ? payload.imageUrls : payload.images || [];
  const creatorId = payload.creatorId || payload.creator?.id || `creator-${id}`;

  return {
    ...payload,
    id: String(payload.id || id),
    title: payload.title || 'Untitled Project',
    description: payload.description || 'Project details are being prepared by the campaign creator.',
    targetAmount,
    currentAmount,
    creatorId,
    imageUrl: payload.imageUrl || imageUrls[0],
    imageUrls,
    category: payload.category || 'Community',
    status: toStatus(payload.status),
    donorCount: payload.donorCount ?? payload.donors ?? 0,
    creator: payload.creator || {
      id: creatorId,
      name: payload.creatorName || 'StellarAid Creator',
      verified: Boolean(payload.isVerified),
    },
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  };
}

function getFallbackIndex(id: string) {
  if (/^\d+$/.test(id)) {
    const numericId = Number(id);
    return numericId >= 1 && numericId <= 60 ? numericId - 1 : null;
  }

  const projectMatch = id.match(/^project-(\d+)-(\d+)$/);
  if (projectMatch) {
    return (Number(projectMatch[1]) - 1) * 9 + Number(projectMatch[2]);
  }

  const featuredMatch = id.match(/^featured-(\d+)$/);
  if (featuredMatch) {
    return Number(featuredMatch[1]);
  }

  if (/^proj_\d+$/.test(id)) {
    return 6;
  }

  return null;
}

function createFallbackProject(id: string): Project | null {
  const index = getFallbackIndex(id);
  if (index === null) {
    return null;
  }

  const category = CATEGORIES[index % CATEGORIES.length] ?? 'Community';
  const fallbackLocation = ['Lagos, Nigeria', 'Quito, Ecuador', 'Accra, Ghana', 'Manila, Philippines'];
  const fallbackName = ['Maya Okoro', 'Daniel Rivera', 'Amina Cole', 'Samir Patel'];
  const targetAmount = 20000 + (index % 8) * 7500;
  const progress = Math.min(28 + (index * 13) % 71, 97);
  const currentAmount = Math.round((targetAmount * progress) / 100);
  const daysRemaining = 7 + (index % 6) * 6;
  const deadline = new Date(Date.now() + daysRemaining * 86400000).toISOString();
  const imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0] ?? '/globe.svg';

  return normalizeProject(
    {
      id,
      title: `${category} Impact Campaign`,
      summary: `A verified campaign advancing ${category.toLowerCase()} outcomes with transparent Stellar donations.`,
      description:
        `This campaign supports measurable ${category.toLowerCase()} work through local partners, community reporting, and transparent donation tracking on Stellar.`,
      story:
        `The project team is coordinating resources, volunteers, and field partners to deliver practical help where it is needed most. Donations help cover supplies, logistics, and follow-up reporting so supporters can see the campaign's progress.`,
      impact:
        `Every contribution moves the campaign closer to its goal and helps the creator publish more updates for donors.`,
      targetAmount: String(targetAmount),
      currentAmount: String(currentAmount),
      creatorId: `creator-${index + 1}`,
      imageUrl,
      imageUrls: [imageUrl, FALLBACK_IMAGES[(index + 1) % FALLBACK_IMAGES.length] ?? imageUrl],
      category,
      status: progress > 90 ? 'almost-funded' : 'active',
      isVerified: index % 2 === 0,
      isUrgent: index % 5 === 0,
      donorCount: 48 + index * 7,
      deadline,
      daysRemaining,
      location: fallbackLocation[index % 4] ?? fallbackLocation[0] ?? 'Remote',
      creator: {
        id: `creator-${index + 1}`,
        name: fallbackName[index % 4] ?? fallbackName[0] ?? 'StellarAid Creator',
        bio: 'Campaign organizer coordinating verified updates, local delivery, and donor reporting.',
        location: fallbackLocation[index % 4] ?? fallbackLocation[0] ?? 'Remote',
        verified: index % 2 === 0,
      },
      updates: [
        {
          id: `${id}-update-1`,
          campaignId: id,
          title: 'Milestone report published',
          content: 'The creator shared a field update with current needs, delivery progress, and the next funding milestone.',
          imageUrls: [imageUrl],
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: `${id}-update-2`,
          campaignId: id,
          title: 'Campaign kickoff',
          content: 'The project was reviewed and opened for StellarAid donations.',
          createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    id
  );
}

async function fetchProject(id: string): Promise<Project | null> {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

  try {
    const response = await fetch(`${apiBaseUrl}/projects/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Project API returned ${response.status}`);
    }

    const json = (await response.json()) as { data?: ProjectApiPayload } | ProjectApiPayload;
    const wrappedPayload = json as { data?: ProjectApiPayload };
    const payload = wrappedPayload.data || (json as ProjectApiPayload);

    return normalizeProject(payload, id);
  } catch {
    return createFallbackProject(id);
  }
}

export default async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const project = await fetchProject(params.id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailsClient project={project} />;
}
