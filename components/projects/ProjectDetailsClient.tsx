/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Copy,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { DonationModal } from '@/components/donations/DonationModal';
import type { DonationReceipt } from '@/components/donations/TransactionSuccessModal';
import { FundingProgress } from '@/components/projects/FundingProgress';
import { ImageGallery, type GalleryImage } from '@/components/projects/ImageGallery';
import type { Project, Update } from '@/types/api';

interface ProjectDetailsClientProps {
  project: Project;
}

function toNumber(value: string | number | undefined) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getDaysRemaining(project: Project) {
  if (typeof project.daysRemaining === 'number') {
    return project.daysRemaining;
  }

  if (!project.deadline) {
    return undefined;
  }

  const deadline = new Date(project.deadline).getTime();
  if (!Number.isFinite(deadline)) {
    return undefined;
  }

  const remaining = Math.ceil((deadline - Date.now()) / 86400000);
  return Math.max(remaining, 0);
}

function getDonorCount(project: Project) {
  return project.donorCount ?? project.donors ?? 0;
}

function getProjectImages(project: Project): GalleryImage[] {
  const urls = project.imageUrls?.length ? project.imageUrls : project.imageUrl ? [project.imageUrl] : [];

  return urls.map((url, index) => ({
    src: url,
    alt: `${project.title} image ${index + 1}`,
    caption: index === 0 ? project.title : `Campaign image ${index + 1}`,
  }));
}

function getUpdates(project: Project, images: GalleryImage[]): Update[] {
  if (project.updates?.length) {
    return project.updates;
  }

  return [
    {
      id: `${project.id}-launch`,
      campaignId: project.id,
      title: 'Campaign launched',
      content: `${project.title} is now accepting donations from StellarAid supporters.`,
      imageUrls: images[0]?.src ? [images[0].src] : [],
      createdAt: project.createdAt,
    },
  ];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const [projectState, setProjectState] = useState(project);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const images = useMemo(() => getProjectImages(projectState), [projectState]);
  const updates = useMemo(() => getUpdates(projectState, images), [projectState, images]);
  const currentAmount = toNumber(projectState.currentAmount);
  const targetAmount = toNumber(projectState.targetAmount);
  const donorCount = getDonorCount(projectState);
  const daysRemaining = getDaysRemaining(projectState);
  const creator = projectState.creator;

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  function handleDonationSuccess(receipt: DonationReceipt) {
    setProjectState((current) => ({
      ...current,
      currentAmount: String(toNumber(current.currentAmount) + receipt.usdEquivalent),
      donorCount: getDonorCount(current) + 1,
    }));
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({
        title: projectState.title,
        text: projectState.summary || projectState.description,
        url: shareUrl || window.location.href,
      });
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Support ${projectState.title} on StellarAid.`);
  const socialLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="border-b border-neutral-200 bg-white pt-24">
        <div className="container mx-auto max-w-[1280px] px-4 py-5">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <Link href="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="max-w-[260px] truncate text-neutral-900">{projectState.title}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto max-w-[1280px] px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-8">
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-bold uppercase text-secondary-700">
                      {projectState.category || 'Community'}
                    </span>
                    {projectState.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase text-primary-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                    {projectState.isUrgent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-3 py-1 text-xs font-bold uppercase text-danger-700">
                        <Zap className="h-3.5 w-3.5" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">
                    {projectState.title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
                    {projectState.summary || projectState.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                    aria-label="Share project"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                    aria-label="Copy project link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {images.length ? (
                <ImageGallery images={images} />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-neutral-200 bg-gradient-to-br from-primary-100 via-white to-secondary-100">
                  <Sparkles className="h-12 w-12 text-primary-500" />
                </div>
              )}
              {copied && <p className="mt-3 text-sm font-semibold text-success-700">Project link copied.</p>}
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-neutral-900">Campaign Story</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700 md:text-base">
                <p>{projectState.story || projectState.description}</p>
                {projectState.impact && <p>{projectState.impact}</p>}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-neutral-900">Updates</h2>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
                  {updates.length} update{updates.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-6 space-y-5">
                {updates.map((update) => (
                  <article key={update.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-neutral-900">{update.title}</h3>
                      <span className="text-sm font-medium text-neutral-500">{formatDate(update.createdAt)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">{update.content}</p>
                    {update.imageUrls?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {update.imageUrls.slice(0, 2).map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt={update.title}
                            loading="lazy"
                            className="h-44 w-full rounded-lg border border-neutral-200 object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-neutral-900">Creator</h2>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary-600">
                  {creator?.avatar ? (
                    <img src={creator.avatar} alt={creator.name || 'Project creator'} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900">{creator?.name || 'StellarAid Creator'}</h3>
                    {(creator?.verified || projectState.isVerified) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified creator
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {creator?.bio || 'This creator has submitted project documentation for StellarAid review.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-500">
                    {creator?.location || projectState.location ? (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {creator?.location || projectState.location}
                      </span>
                    ) : null}
                    {creator?.email ? (
                      <a href={`mailto:${creator.email}`} className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
                        <Mail className="h-4 w-4" />
                        Contact creator
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <FundingProgress
              currentAmount={currentAmount}
              targetAmount={targetAmount}
              donorCount={donorCount}
              daysRemaining={daysRemaining}
            />

            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <button
                type="button"
                onClick={() => setIsDonationOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-base font-bold text-white shadow-stellar transition hover:bg-primary-700"
              >
                <Heart className="h-5 w-5" />
                Donate Now
              </button>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <CalendarDays className="h-4 w-4 text-warning-500" />
                  <p className="mt-2 font-bold text-neutral-900">
                    {typeof daysRemaining === 'number' ? `${daysRemaining} days` : 'Open'}
                  </p>
                  <p className="text-xs text-neutral-500">Campaign window</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <ExternalLink className="h-4 w-4 text-primary-500" />
                  <p className="mt-2 font-bold text-neutral-900">{projectState.status || 'Active'}</p>
                  <p className="text-xs text-neutral-500">Status</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Share Campaign</h2>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { href: socialLinks.x, label: 'Share on X', icon: FaXTwitter },
                  { href: socialLinks.facebook, label: 'Share on Facebook', icon: FaFacebookF },
                  { href: socialLinks.whatsapp, label: 'Share on WhatsApp', icon: FaWhatsapp },
                  { href: socialLinks.linkedin, label: 'Share on LinkedIn', icon: FaLinkedinIn },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                      aria-label={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </section>

            <section className={clsx('rounded-xl border p-5 shadow-sm', projectState.isUrgent ? 'border-danger-200 bg-danger-50' : 'border-primary-100 bg-primary-50')}>
              <h2 className={clsx('text-sm font-bold uppercase', projectState.isUrgent ? 'text-danger-700' : 'text-primary-700')}>
                {projectState.isUrgent ? 'Urgent Need' : 'Verified Impact'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {projectState.isUrgent
                  ? 'This campaign has been marked urgent due to time-sensitive needs.'
                  : 'Project information is reviewed so donors can support with confidence.'}
              </p>
            </section>
          </aside>
        </div>
      </main>

      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        onSuccess={handleDonationSuccess}
        project={{
          id: projectState.id,
          title: projectState.title,
          imageUrl: projectState.imageUrl || images[0]?.src,
        }}
      />
    </div>
  );
}

export default ProjectDetailsClient;

