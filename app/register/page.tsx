'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { User, Palette, Building2 } from 'lucide-react';

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
  const accountTypes = [
    {
      title: 'Client',
      description: 'Hire talented creators for your projects',
      href: '/register/client',
      icon: <User className="w-8 h-8" />,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      title: 'Artist',
      description: 'Sell your creative work and commissions',
      href: '/register/artist',
      icon: <Palette className="w-8 h-8" />,
      color: 'bg-secondary-500 hover:bg-secondary-600',
    },
    {
      title: 'Agency',
      description: 'Manage a team of creative professionals',
      href: '/register/agency',
      icon: <Building2 className="w-8 h-8" />,
      color: 'bg-primary-500 hover:bg-primary-600',
    },
  ];

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-white">Create an Account</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">Join the StellarAid community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accountTypes.map((type) => (
            <Link
              key={type.title}
              href={type.href}
              className={`${type.color} p-8 rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{type.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{type.title}</h2>
                <p className="text-white/90">{type.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-neutral-500 dark:text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}