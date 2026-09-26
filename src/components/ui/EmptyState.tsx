import { Button } from './Button'

interface EmptyStateProps {
  /** Icon name or custom icon component */
  icon?: React.ReactNode
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Call-to-action button */
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
    asChild?: boolean
    href?: string
  }
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'py-6',
  md: 'py-12',
  lg: 'py-16',
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${SIZE_CLASSES[size]} ${className}`}>
      {icon && (
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-line/50 flex items-center justify-center text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-h3">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-caption text-muted">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action.asChild && action.href ? (
            <Button variant={action.variant ?? 'primary'} asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button variant={action.variant ?? 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}