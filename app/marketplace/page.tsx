import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace | StellarAid',
  description:
    'Browse the StellarAid marketplace for unique digital art, collectibles, and creative works. Support independent creators with transparent Stellar blockchain transactions.',
  openGraph: {
    title: 'Marketplace | StellarAid',
    description:
      'Browse the StellarAid marketplace for unique digital art, collectibles, and creative works. Support independent creators with transparent Stellar blockchain transactions.',
    images: ['/og-image.jpg'],
  },
};

export default function Marketplace() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Marketplace</h1>
      <p className="text-xl text-gray-600">Discover and collect unique creative works</p>
    </main>
  );
}
