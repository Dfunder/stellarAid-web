'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectUser } from '@/app/features/auth/authSelectors';
import { fetchCurrentUser } from '@/app/features/auth/authThunks';
import { fetchDashboardStats, fetchRecentActivity } from '@/app/features/dashboard/dashboardThunks';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivity(10));
  }, [dispatch]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back{user?.name ? ", " + user.name : ""}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Here is what is happening with your account.</p>
      </div>
    </DashboardLayout>
  );
}
