"use client";

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function AdminContent() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#f0f4fa] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, campaigns, and system settings.
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-[#1a3a6b]">1,234</p>
            <p className="text-sm text-green-600 mt-1">+12% this month</p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Active Campaigns
            </h3>
            <p className="text-3xl font-bold text-[#1a3a6b]">45</p>
            <p className="text-sm text-green-600 mt-1">+8% this month</p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-[#1a3a6b]">$89,450</p>
            <p className="text-sm text-green-600 mt-1">+23% this month</p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pending Approvals
            </h3>
            <p className="text-3xl font-bold text-orange-600">7</p>
            <p className="text-sm text-gray-600 mt-1">Need review</p>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated" padding="lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              User Management
            </h3>
            <div className="space-y-3">
              <Button variant="primary" fullWidth className="mb-2">
                View All Users
              </Button>
              <Button variant="secondary" fullWidth className="mb-2">
                Manage Roles
              </Button>
              <Button variant="secondary" fullWidth>
                Export User Data
              </Button>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Campaign Management
            </h3>
            <div className="space-y-3">
              <Button variant="primary" fullWidth className="mb-2">
                Create New Campaign
              </Button>
              <Button variant="secondary" fullWidth className="mb-2">
                Review Pending Campaigns
              </Button>
              <Button variant="secondary" fullWidth>
                Campaign Analytics
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Admin Activity */}
        <Card variant="elevated" padding="lg" className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Admin Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">
                  Approved campaign &quot;Clean Water Initiative&quot;
                </p>
                <p className="text-sm text-gray-600">
                  Admin: {user?.name} • 1 hour ago
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Approved
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">
                  Updated user role to moderator
                </p>
                <p className="text-sm text-gray-600">
                  Admin: {user?.name} • 3 hours ago
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Role Change
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">
                  Suspended user account for policy violation
                </p>
                <p className="text-sm text-gray-600">
                  Admin: {user?.name} • 5 hours ago
                </p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Suspended
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}
