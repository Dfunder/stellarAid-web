import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-primary-700 dark:text-primary-400">404</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-xl transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-700 text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium rounded-xl transition-colors"
          >
            Explore Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
