"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex items-center justify-center p-6">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md text-center"
      >
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this page. Please contact
          your administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button variant="primary" fullWidth>
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/auth/login" className="block">
            <Button variant="secondary" fullWidth>
              Sign In with Different Account
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          If you need assistance, please contact our support team.
        </p>
      </Card>
    </div>
  );
}
