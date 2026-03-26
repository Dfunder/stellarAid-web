import type { Metadata } from 'next';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | StellarAid',
  description:
    'Create a new password for your StellarAid account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
