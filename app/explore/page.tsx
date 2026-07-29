import { Metadata } from "next";

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
    <main id="main-content" className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Explore</h1>
      <p className="text-xl text-gray-600">Discover amazing crowdfunding projects</p>
    </main>
  );
}