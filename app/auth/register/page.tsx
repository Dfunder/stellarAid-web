'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../features/auth/authThunks';
import { selectAuthLoading, selectAuthError } from '../../features/auth/authSelectors';
import ErrorMessage from '../../components/common/ErrorMessage';
import ButtonSpinner from '../../components/common/ButtonSpinner';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const { fullName, email, password, confirmPassword } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLocalError(null);
    dispatch(registerUser({ fullName, email, password }))
      .then((result: any) => {
        if (registerUser.fulfilled.match(result)) {
          router.push('/auth/check-email');
        }
      })
      .catch(() => {
        // Handled by Redux authError state
      });
  };

  return (
    <div>
      <h1>Create an Account</h1>
      <form onSubmit={handleSubmit}>
        {authError && <ErrorMessage message={authError} />}
        {localError && <ErrorMessage message={localError} />}
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={handleChange}
            required
          />
          <PasswordStrengthIndicator password={password} />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={Boolean(isLoading)}>
          <ButtonSpinner isLoading={Boolean(isLoading)}>Sign Up</ButtonSpinner>
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
