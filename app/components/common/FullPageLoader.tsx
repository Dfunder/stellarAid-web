'use client';

import React from 'react';
import Spinner from './Spinner';

interface FullPageLoaderProps {
  message?: string;
  showSpinner?: boolean;
}

/**
 * Full-page loading overlay that covers the entire viewport
 * @param message - Optional loading message to display
 * @param showSpinner - Whether to show the spinner (default: true)
 */
const FullPageLoader: React.FC<FullPageLoaderProps> = ({ 
  message = 'Loading...', 
  showSpinner = true 
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      aria-label="Loading page"
      role="status"
    >
      <div className="flex flex-col items-center space-y-4">
        {showSpinner && <Spinner size="lg" className="text-blue-600 dark:text-blue-400" />}
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;