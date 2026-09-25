import { Link } from 'react-router-dom'
import { linkClass } from './formStyles'

/** Shell for the registration flow; the form itself lands with the registration issue. */
export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-h2">Create your account</h1>
      <p className="mt-2 text-body text-muted">Start funding and launching campaigns on Lumora.</p>
      <p className="mt-8 text-center text-caption text-muted">
        Already have an account?{' '}
        <Link to="/login" className={linkClass}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
