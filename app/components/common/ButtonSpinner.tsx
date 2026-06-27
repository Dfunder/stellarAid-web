'use client';

import React from 'react';
import Spinner from './Spinner';

interface ButtonSpinnerProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button component with built-in loading spinner state
 * @param isLoading - Whether the button is in loading state
 * @param children - Button content to display when not loading
 * @param loadingText - Optional text to show during loading
 * @param className - Additional CSS classes for the button
 * @param disabled - Whether the button is disabled
 * @param onClick - Click handler function
 * @param type - Button type attribute
 */
const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  isLoading,
  children,
  loadingText = 'Processing...',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg
        transition-colors duration-200
        ${isLoading || disabled 
          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        ${className}
      `}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Loading' : undefined}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default ButtonSpinner;