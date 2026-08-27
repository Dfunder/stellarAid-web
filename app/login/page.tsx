import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | StellarAid',
  description:
    'Login to your StellarAid account to manage your projects, track contributions, and connect with the creative community on the Stellar Network.',
  openGraph: {
    title: 'Login | StellarAid',
    description:
      'Login to your StellarAid account to manage your projects, track contributions, and connect with the creative community on the Stellar Network.',
    images: ['/og-image.jpg'],
  },
};

export default function Login() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Login</h1>
      <p className="text-xl text-gray-600">Access your StellarAid account</p>
    </main>
  );
}
