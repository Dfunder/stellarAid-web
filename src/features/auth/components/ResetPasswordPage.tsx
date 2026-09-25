import { Link } from 'react-router-dom'
import { linkClass } from './formStyles'

/** Shell for choosing a new password from a reset link (`?token=`). */
export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-h2">Reset your password</h1>
      <p className="mt-2 text-body text-muted">Choose a new password for your account.</p>
      <p className="mt-8 text-center text-caption text-muted">
        <Link to="/login" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
