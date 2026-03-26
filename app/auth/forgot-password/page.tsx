import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | StellarAid',
  description:
    'Reset your StellarAid password securely via email verification.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
