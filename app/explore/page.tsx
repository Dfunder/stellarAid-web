import { Metadata } from "next";
import dynamic from 'next/dynamic';

const ExploreProjects = dynamic(() => import("./components/ExploreProjects"), {
  loading: () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex gap-3">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-2 w-full animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>
      ))}
    </div>
  ),
  ssr: false,
});

export const metadata: Metadata = {
  title: "Explore | StellarAid",
  description: "Explore innovative crowdfunding projects on StellarAid. Discover creators, artists, and entrepreneurs building amazing things with blockchain-powered transparency.",
  openGraph: {
    title: "Explore | StellarAid",
    description: "Explore innovative crowdfunding projects on StellarAid. Discover creators, artists, and entrepreneurs building amazing things with blockchain-powered transparency.",
    images: ["/og-image.jpg"],
  },
};

export default function Explore() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Explore</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Discover amazing crowdfunding projects
          </p>
        </header>

        <section aria-label="Crowdfunding projects">
          <ExploreProjects />
        </section>
      </div>
    </main>
  );
}
