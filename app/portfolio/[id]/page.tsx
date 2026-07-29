import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  
  return {
    title: `Portfolio Detail #${id} | StellarAid`,
    description: `View details for portfolio item #${id} on StellarAid. Learn about this creative project and support the creator through transparent Stellar blockchain crowdfunding.`,
    openGraph: {
      title: `Portfolio Detail #${id} | StellarAid`,
      description: `View details for portfolio item #${id} on StellarAid. Learn about this creative project and support the creator through transparent Stellar blockchain crowdfunding.`,
      images: ["/og-image.jpg"],
    },
  };
}

export default function PortfolioDetail({ params }: Props) {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Portfolio Detail #{params.id}</h1>
      <p className="text-xl text-gray-600">Portfolio item details page</p>
    </main>
  );
}