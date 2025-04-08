'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/redux/slices/authSlice';
import { useProtectedRoute } from '@/redux/hooks';
import { Loader } from '@/components/ui/Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: User['role'] | User['role'][];
  fallbackUrl?: string;
}

/**
 * Component to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 * Redirects to fallback URL if user doesn't have required role
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  fallbackUrl = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, hasRequiredRole } = useProtectedRoute(requiredRoles);

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      // Save the current path to redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectUrl', pathname);
      }
      router.push(`${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`);
    }
    
    // If authenticated but missing required role, redirect to fallback
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, router, pathname, fallbackUrl]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" label="Checking authorization..." />
      </div>
    );
  }

  // If authenticated and has required role, render children
  if (isAuthenticated && hasRequiredRole) {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
}

export default ProtectedRoute;
