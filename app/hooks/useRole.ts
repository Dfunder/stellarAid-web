'use client';

import { useAppSelector } from '@/app/store/hooks';
import { selectUserRole } from '@/app/features/auth/authSelectors';

export function useRole() {
  const role = useAppSelector(selectUserRole);
  return {
    isAdmin: role === 'admin',
    isUser: role === 'user',
    role,
  };
}
