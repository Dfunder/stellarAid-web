import { getCampaigns } from "@/lib/campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { Container } from "@/components/ui/Container";

type SearchParams = { q?: string; page?: string };

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const campaigns = await getCampaigns(query);

  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Container className="py-16">
        <h1 className="text-3xl font-semibold">Campaigns</h1>
        <p className="mt-2 text-foreground/70">
          Browse and support campaigns on StellarAid
        </p>

        {campaigns.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/5 py-16 text-center">
            <h2 className="text-xl font-medium">No campaigns found</h2>
            <p className="max-w-md text-foreground/70">
              {query
                ? `No campaigns match "${query}". Try a different search.`
                : "There are no campaigns yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
