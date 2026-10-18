import { Link } from 'react-router-dom'
import ResetPasswordForm from '@/components/ResetPasswordForm'
import { linkClass } from './formStyles'

/** Password-reset request page with email validation (#932). */
export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-h2">Forgot your password?</h1>
      <p className="mt-2 text-body text-muted">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>
      <div className="mt-6">
        <ResetPasswordForm
          onSubmit={async () => {
            // Wire to authService.requestPasswordReset when available.
          }}
        />
      </div>
      <p className="mt-8 text-center text-caption text-muted">
        <Link to="/login" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
