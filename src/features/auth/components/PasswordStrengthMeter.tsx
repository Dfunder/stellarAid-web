import { cn } from '@/lib'
import { getPasswordStrength } from '../utils'

const FILLED_BAR_CLASSES = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success']
const BAR_COUNT = 4

/** Live password strength meter; renders nothing until the user types. */
export default function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password)
  if (!label) return null

  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-control',
              index < score ? FILLED_BAR_CLASSES[score] : 'bg-line',
            )}
          />
        ))}
      </div>
      <p className="text-caption-sm text-muted">
        Password strength: <span className="font-semibold text-foreground">{label}</span>
      </p>
    </div>
  )
}
