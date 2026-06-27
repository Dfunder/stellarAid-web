'use client';

import Image from "next/image";
import { toastSuccess, toastError, toastInfo, toastLoading, toastDismiss } from '@/utils/toast';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchData } from './store/slices/apiSlice';
import { useState, useEffect } from 'react';
import env from './config/env';
import { Spinner, FullPageLoader, ButtonSpinner } from './components/common';
import { MainLayout } from './components/layout';

export default function Home() {
  const { loading, error, data } = useAppSelector((state) => state.api);
  const dispatch = useAppDispatch();
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  // State for spinner demos
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  // Log environment configuration on component mount
  useEffect(() => {
    console.log('🌐 Environment Configuration:', {
      apiBaseUrl: env.apiBaseUrl,
      stellarNetwork: env.stellarNetwork,
      isDevelopment: env.isDevelopment,
      isProduction: env.isProduction,
    });
  }, []);

  // Demo full page loader
  const handleShowFullPageLoader = () => {
    setShowFullPageLoader(true);
    setTimeout(() => setShowFullPageLoader(false), 3000);
  };

  // Demo button loading state
  const handleButtonLoading = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 3000);
  };

  const handleShowSuccess = () => {
    toastSuccess('Operation completed successfully!');
  };

  const handleShowError = () => {
    toastError('Something went wrong! Please try again.');
  };

  const handleShowInfo = () => {
    toastInfo('Here is some useful information for you.');
  };

  const handleShowLoading = () => {
    const id = toastLoading('Processing your request...');
    setLoadingToastId(id);
  };

  const handleDismissLoading = () => {
    if (loadingToastId) {
      toastDismiss(loadingToastId);
      setLoadingToastId(null);
    }
  };

  const handleApiCall = () => {
    // This will fail to demonstrate error handling
    dispatch(fetchData('https://api.example.com/data'));
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          StellarAid: Redux Toolkit + Toast System Demo
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative z-0 flex place-items-center my-16 before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-left gap-8">
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Toast Notification Demos</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShowSuccess}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={handleShowError}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={handleShowInfo}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Info Toast
            </button>
            <button
              onClick={handleShowLoading}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
            >
              Loading Toast
            </button>
            <button
              onClick={handleDismissLoading}
              disabled={!loadingToastId}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dismiss Loading
            </button>
            <button
              onClick={handleApiCall}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
            >
              Test API Call
            </button>
          </div>
          
          {loading && (
            <div className="mt-4 p-2 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200 text-sm">
              API request in progress...
            </div>
          )}
          {error && (
            <div className="mt-4 p-2 bg-red-100 dark:bg-red-900 rounded text-red-800 dark:text-red-200 text-sm">
              Error: {error}
            </div>
          )}
          {data && (
            <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 text-sm">
              Data loaded successfully!
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Features Implemented</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Global <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Toaster</code> in root layout</li>
            <li>Redux Toolkit configured as global state management</li>
            <li>Redux DevTools automatically configured</li>
            <li>Environment variables with validation and type safety</li>
            <li>Reusable loading spinner components with size variations</li>
            <li>FullPageLoader for viewport-wide loading overlays</li>
            <li>ButtonSpinner for loading states inside buttons</li>
            <li>StellarAid theme colors for all toast types</li>
            <li>Success, error, info, and loading toast helpers</li>
            <li>Async thunks with proper loading/success/error states</li>
          </ul>
        </div>

        {/* Environment Status Display */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Current Environment Status</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Environment:</span>{' '}
              <span className={`font-medium ${env.isDevelopment ? 'text-green-600' : 'text-blue-600'}`}>
                {env.isDevelopment ? 'Development' : 'Production'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Stellar Network:</span>{' '}
              <span className="font-medium text-purple-600">{env.stellarNetwork}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400">API Base URL:</span>{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                {env.apiBaseUrl}
              </code>
            </div>
          </div>
        </div>

        {/* Spinner Demo Section */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Loading Spinner Components</h3>
          
          {/* Spinner Sizes */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Spinner Sizes (sm, md, lg):</h4>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center">
                <Spinner size="sm" className="text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-gray-500">sm</span>
              </div>
              <div className="flex flex-col items-center">
                <Spinner size="md" className="text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-gray-500">md</span>
              </div>
              <div className="flex flex-col items-center">
                <Spinner size="lg" className="text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-gray-500">lg</span>
              </div>
            </div>
          </div>

          {/* Button Spinner Demo */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">ButtonSpinner Demo:</h4>
            <div className="flex items-center gap-4">
              <ButtonSpinner 
                isLoading={isButtonLoading}
                onClick={handleButtonLoading}
              >
                Click to Load
              </ButtonSpinner>
              <button 
                onClick={handleShowFullPageLoader}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Show Full Page Loader
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 dark:text-white">Files Created/Modified</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/components/common/Spinner.tsx</code> - Core spinner component</li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/components/common/FullPageLoader.tsx</code> - Full page loading overlay</li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/components/common/ButtonSpinner.tsx</code> - Button with loading state</li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">utils/toast.ts</code> - Toast helpers</li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/layout.tsx</code> - Added Toaster & ReduxProvider</li>
          </ul>
        </div>

        {/* Full Page Loader - will overlay everything when active */}
        {showFullPageLoader && <FullPageLoader message="Loading content..." />}
      </div>
      </div>
    </MainLayout>
  );
}