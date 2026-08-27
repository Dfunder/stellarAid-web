import { Metadata } from 'next';
import MarketplaceClient from './components/MarketplaceClient';

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
  return <MarketplaceClient />;
}
