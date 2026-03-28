"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

// Role type for access control
export type UserRole = "admin" | "user" | "moderator" | "creator";

// Protected route props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

// JWT token validation utility
const isTokenValid = (token: string): boolean => {
  try {
    // Decode JWT payload (without verification for simplicity)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Invalid token format:", error);
    return false;
  }
};

// Check if user has required role
const hasRequiredRole = (
  user: User | null,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[],
): boolean => {
  if (!user) return false;
  if (!requiredRole && !allowedRoles) return true;

  const userRole = (user as any).role as UserRole;

  if (allowedRoles) {
    return allowedRoles.includes(userRole);
  }

  if (requiredRole) {
    return userRole === requiredRole;
  }

  return false;
};

// Loading spinner component
const DefaultLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3a6b]"></div>
  </div>
);

// Main ProtectedRoute HOC component
export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  fallbackPath = "/auth/login",
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);

      // If auth store is still loading, wait
      if (isLoading) {
        return;
      }

      // Check if user is authenticated and token is valid
      const isTokenValidValue = token ? isTokenValid(token) : false;
      const isUserAuthenticated = isAuthenticated && isTokenValidValue;

      if (!isUserAuthenticated) {
        // Store intended destination and redirect to login
        if (
          typeof window !== "undefined" &&
          pathname !== fallbackPath &&
          pathname !== "/auth/login"
        ) {
          sessionStorage.setItem("intended-destination", pathname);
        }
        router.replace(fallbackPath);
        setIsAuthorized(false);
        setIsCheckingAuth(false);
        return;
      }

      // Check role-based access
      const hasRoleAccess = hasRequiredRole(user, requiredRole, allowedRoles);

      if (!hasRoleAccess) {
        // Redirect to unauthorized page or dashboard
        router.replace("/unauthorized");
        setIsAuthorized(false);
        setIsCheckingAuth(false);
        return;
      }

      // User is authenticated and authorized
      setIsAuthorized(true);
      setIsCheckingAuth(false);

      // Clear intended destination if we're on the intended page
      if (typeof window !== "undefined") {
        const intendedDest = sessionStorage.getItem("intended-destination");
        if (pathname === intendedDest) {
          sessionStorage.removeItem("intended-destination");
        }
      }
    };

    checkAuthentication();
  }, [
    isAuthenticated,
    token,
    user,
    isLoading,
    requiredRole,
    allowedRoles,
    router,
    pathname,
    fallbackPath,
  ]);

  // Show loading state during auth check
  if (isCheckingAuth || isLoading) {
    return loadingComponent || <DefaultLoadingSpinner />;
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component wrapper
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">,
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Get intended destination from session storage
const getIntendedDestination = (): string => {
  if (typeof window === "undefined") return "/dashboard";
  return sessionStorage.getItem("intended-destination") || "/dashboard";
};

// Hook for getting intended destination
export function useIntendedDestination(): string {
  return getIntendedDestination();
}

// Hook for redirecting to intended destination
export function useRedirectToIntended() {
  const router = useRouter();
  const intendedDestination = useIntendedDestination();

  const redirect = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("intended-destination");
    }
    router.replace(intendedDestination);
  };

  return { redirect, intendedDestination };
}

export default ProtectedRoute;
