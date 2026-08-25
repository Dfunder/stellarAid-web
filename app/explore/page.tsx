import { Metadata } from "next";

import ExploreProjects from "./components/ExploreProjects";

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
