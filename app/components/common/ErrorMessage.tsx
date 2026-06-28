'use client';

import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectApiErrorByKey } from '../../features/errors/errorSelectors';

interface ErrorMessageProps {
  errorKey: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorKey, className = '' }) => {
  const errorMessage = useAppSelector(selectApiErrorByKey(errorKey));

  if (!errorMessage) return null;

  return (
    <div
      className={`flex items-start p-4 rounded-lg bg-red-50 border border-red-200 ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-red-800">{errorMessage}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;