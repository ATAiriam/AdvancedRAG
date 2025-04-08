'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/ui/Toast';
import Header from './Header';
import Sidebar from './Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useAuth } from '@/redux/hooks';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component with responsive sidebar and header
 */
export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, getCurrentUser } = useAuth();
  const { loadTenantTheme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isOnline, hasReconnected, processQueuedActions } = useOfflineStatus();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when screen size changes from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Initialize user and tenant theme
  useEffect(() => {
    const initializeApp = async () => {
      setIsSettingUp(true);
      
      if (isAuthenticated && user) {
        // Load tenant theme
        if (user.tenantId) {
          await loadTenantTheme(user.tenantId);
        }
      } else {
        // Try to restore session
        try {
          await getCurrentUser();
        } catch (error) {
          // Session expired or user not logged in
          console.log('No active session found');
        }
      }
      
      setIsSettingUp(false);
    };
    
    initializeApp();
  }, [isAuthenticated, user, getCurrentUser, loadTenantTheme]);

  // Process offline actions when coming back online
  useEffect(() => {
    if (hasReconnected) {
      processQueuedActions();
    }
  }, [hasReconnected, processQueuedActions]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Different padding based on device
  const contentClass = isMobile
    ? 'pt-16 pb-16 px-4 sm:px-6' // Extra padding for mobile bottom bar
    : 'pt-16 md:pl-64 px-4 sm:px-6 lg:px-8';

  return (
    <ToastProvider position="top-right">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-amber-500 dark:bg-amber-600 text-white text-center py-1 text-sm z-50">
          You are offline. Some features may be limited.
        </div>
      )}

      {/* Header */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <main className={`flex-1 min-h-screen ${contentClass}`}>
        {/* Add top margin if offline */}
        <div className={`${!isOnline ? 'mt-7' : ''}`}>
          {children}
        </div>
      </main>
    </ToastProvider>
  );
}

export default MainLayout;
