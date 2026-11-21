import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

type ButtonOnlyProps = Extract<ButtonProps, { href?: undefined }>;

export type SubmitButtonProps = Omit<ButtonOnlyProps, "children" | "type"> & {
  children: ReactNode;
  isSubmitting?: boolean;
  submittingLabel?: string;
};

export function SubmitButton({
  isSubmitting = false,
  submittingLabel = "Submitting...",
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting || undefined}
    >
      {isSubmitting ? submittingLabel : children}
    </Button>
  );
}
