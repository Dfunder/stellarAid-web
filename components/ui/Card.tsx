import { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Card variant
export type CardVariant = 'default' | 'bordered' | 'elevated' | 'outline';

// Card component props
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Card Header props
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Card Body props
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Card Footer props
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Card component
export const Card = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) => {
  // Base styles
  const baseStyles = 'rounded-lg';

  // Variant styles
  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white shadow-sm',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
    outline: 'border border-gray-300 bg-transparent',
  };

  // Padding styles
  const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Combine all styles
  const cardStyles = twMerge(
    clsx(baseStyles, variantStyles[variant], paddingStyles[padding], className)
  );

  return (
    <div className={cardStyles} {...props}>
      {children}
    </div>
  );
};

// Card.Header sub-component
export const CardHeader = ({
  className,
  children,
  ...props
}: CardHeaderProps) => {
  const headerStyles = twMerge(
    clsx('font-semibold text-lg text-gray-900 mb-2', className)
  );

  return (
    <div className={headerStyles} {...props}>
      {children}
    </div>
  );
};

// Card.Body sub-component
export const CardBody = ({
  className,
  children,
  ...props
}: CardBodyProps) => {
  const bodyStyles = twMerge(clsx('text-gray-600', className));

  return (
    <div className={bodyStyles} {...props}>
      {children}
    </div>
  );
};

// Card.Footer sub-component
export const CardFooter = ({
  className,
  children,
  ...props
}: CardFooterProps) => {
  const footerStyles = twMerge(
    clsx('mt-4 pt-4 border-t border-gray-200 flex items-center gap-2', className)
  );

  return (
    <div className={footerStyles} {...props}>
      {children}
    </div>
  );
};

export default Card;
