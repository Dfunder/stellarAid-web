import VerifyEmail from './VerifyEmail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email | StellarAid',
  description: 'Verify your email address to activate your StellarAid account.',
};

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
