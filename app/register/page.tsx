import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | StellarAid',
  description:
    'Create your StellarAid account today. Join a community of creators and supporters building the future of transparent crowdfunding on the Stellar blockchain.',
  openGraph: {
    title: 'Register | StellarAid',
    description:
      'Create your StellarAid account today. Join a community of creators and supporters building the future of transparent crowdfunding on the Stellar blockchain.',
    images: ['/og-image.jpg'],
  },
};

export default function Register() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Register</h1>
      <p className="text-xl text-gray-600">Join the StellarAid community</p>
    </main>
  );
}
