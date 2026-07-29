import { Metadata } from "next";

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params.username;
  
  return {
    title: `${username} | Artist Profile | StellarAid`,
    description: `View ${username}'s artist profile on StellarAid. Explore their portfolio of creative works and support their crowdfunding projects on the Stellar Network.`,
    openGraph: {
      title: `${username} | Artist Profile | StellarAid`,
      description: `View ${username}'s artist profile on StellarAid. Explore their portfolio of creative works and support their crowdfunding projects on the Stellar Network.`,
      images: ["/og-image.jpg"],
    },
  };
}

export default function ArtistProfile({ params }: Props) {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">{params.username}'s Profile</h1>
      <p className="text-xl text-gray-600">Artist profile page</p>
    </main>
  );
}