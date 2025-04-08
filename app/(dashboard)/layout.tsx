'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * Dashboard layout that wraps all authenticated pages
 * Applies the main layout and protects routes from unauthorized access
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
