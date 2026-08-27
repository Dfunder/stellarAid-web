import dynamic from 'next/dynamic';
import Hero from './components/landing/Hero';
import { MainLayout } from './components/layout';

// Dynamically import below-the-fold landing page components to reduce initial JS payload and optimize TBT / FID
const CategoriesShowcase = dynamic(() => import('@/components/landing/CategoriesShowcase'), {
  ssr: true,
  loading: () => (
    <section className="py-24 bg-neutral-900/40 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-neutral-800 rounded-lg mb-4" />
        <div className="h-4 w-96 bg-neutral-800 rounded mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-48 bg-neutral-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});

const FeaturedArtists = dynamic(() => import('@/components/landing/FeaturedArtists'), {
  ssr: true,
  loading: () => (
    <section className="py-24 bg-neutral-950 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-56 bg-neutral-800 rounded-lg mb-4" />
        <div className="h-4 w-80 bg-neutral-800 rounded mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-64 bg-neutral-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});

const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'), {
  ssr: true,
  loading: () => (
    <section className="py-24 bg-neutral-900/30 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-neutral-800 rounded-lg mx-auto mb-4" />
        <div className="h-4 w-80 bg-neutral-800 rounded mx-auto mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-72 bg-neutral-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});

export default function Home() {
  return (
    <MainLayout>
      <main id="main-content" className="flex flex-col min-h-screen">
        <Hero />
        <CategoriesShowcase />
        <FeaturedArtists />
        <HowItWorks />
      </main>
    </MainLayout>
  );
}
