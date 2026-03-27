"use client";

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function DashboardContent() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your StellarAid account
            today.
          </p>
        </div>

        {/* User Info Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Account Information
              </h2>
              <p className="text-gray-600">Email: {user?.email}</p>
              <p className="text-gray-600">User ID: {user?.id}</p>
              {(user as any)?.role && (
                <p className="text-gray-600">Role: {(user as any).role}</p>
              )}
            </div>
            <Button variant="secondary" onClick={logout} className="ml-4">
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Donations
            </h3>
            <p className="text-3xl font-bold text-[#1a3a6b]">$12,450</p>
            <p className="text-sm text-gray-600 mt-1">This month</p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Active Campaigns
            </h3>
            <p className="text-3xl font-bold text-[#1a3a6b]">8</p>
            <p className="text-sm text-gray-600 mt-1">Currently supporting</p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Impact Score
            </h3>
            <p className="text-3xl font-bold text-[#1a3a6b]">94</p>
            <p className="text-sm text-gray-600 mt-1">Based on contributions</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card variant="elevated" padding="lg" className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">
                  Donated to Clean Water Fund
                </p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
              <span className="font-semibold text-green-600">$250</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">
                  Supported Education Initiative
                </p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
              <span className="font-semibold text-green-600">$100</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">
                  Joined Climate Action Campaign
                </p>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
              <span className="font-semibold text-blue-600">Joined</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
