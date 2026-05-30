import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  education: { title: 'Education', description: 'Support education campaigns.' },
  health: { title: 'Health', description: 'Support health campaigns.' },
  environment: { title: 'Environment', description: 'Support environment campaigns.' },
  technology: { title: 'Technology', description: 'Support technology campaigns.' },
  arts: { title: 'Arts & Culture', description: 'Support arts campaigns.' },
  community: { title: 'Community', description: 'Support community campaigns.' },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const meta = CATEGORY_META[params.slug];
  if (!meta) return { title: 'Category | StellarAid' };
  return {
    title: `${meta.title} Campaigns | StellarAid`,
    description: meta.description,
    openGraph: { title: `${meta.title} Campaigns | StellarAid`, description: meta.description },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const meta = CATEGORY_META[params.slug];
  if (!meta) notFound();

  return (
    <main className="min-h-screen bg-background">
      {/* Category hero banner */}
      <div className="bg-primary/10 py-12 text-center">
        <h1 className="text-4xl font-bold">{meta.title} Campaigns</h1>
        <p className="mt-2 text-muted-foreground">{meta.description}</p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Filter bar (same as main listing) */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search campaignsâ€¦"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="newest">Newest</option>
            <option value="most-funded">Most Funded</option>
            <option value="ending-soon">Ending Soon</option>
          </select>
        </div>

        {/* Campaign grid placeholder */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <p className="col-span-full text-center text-muted-foreground py-12">
            No campaigns in this category yet.{' '}
            <Link href="/campaigns" className="text-primary underline">
              Browse all campaigns
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
