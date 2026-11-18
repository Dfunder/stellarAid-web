import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ProgressBarSize = "sm" | "md" | "lg";

type ProgressBarProps = {
  /** Current value of the progress bar. */
  value: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Accessible label describing what the bar represents. */
  label: string;
  /** Visual size variant. */
  size?: ProgressBarSize;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "role">;

const sizeClasses: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  size = "md",
  className,
  ...props
}: ProgressBarProps) {
  const clampedMax = max > 0 ? max : 1;
  const clampedValue = Math.max(0, Math.min(value, clampedMax));
  const percent = Math.round((clampedValue / clampedMax) * 100);

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={clampedMax}
        className={cn("w-full overflow-hidden rounded-full bg-foreground/10", sizeClasses[size])}
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="mt-1 block text-sm text-foreground/70">{percent}%</span>
    </div>
  );
}
