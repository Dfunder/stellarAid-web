'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';

import { AdminSidebar } from '@/components/admin/AdminSidebar';

import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return <div className="flex items-center justify-center h-screen">Access Denied</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onMobileClose={() => setIsMobileOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMobileOpen={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}