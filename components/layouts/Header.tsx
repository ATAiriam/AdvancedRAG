'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuth } from '@/redux/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import TenantSelector from '@/components/layouts/TenantSelector';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/**
 * Responsive header component with mobile menu toggle
 */
export function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Check if header is scrolled to add background
  useEffect(() => {
    const checkScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      const notificationsMenu = document.getElementById('notifications-menu');

      if (userMenu && !userMenu.contains(event.target as Node) && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }

      if (notificationsMenu && !notificationsMenu.contains(event.target as Node) && isNotificationsOpen) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isNotificationsOpen]);

  // Close menus when navigating
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  // Handle logout
  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
  };

  // Get current page title based on pathname
  const getPageTitle = () => {
    // Remove leading slash and split by slash
    const path = pathname.slice(1).split('/');
    
    if (path[0] === '') return 'Dashboard';
    if (path[0] === 'chat') return 'Chat';
    if (path[0] === 'files') return 'Files';
    if (path[0] === 'analytics') return 'Analytics';
    if (path[0] === 'users') return 'Users';
    if (path[0] === 'tenants') return 'Tenants';
    
    // Capitalize first letter of path for unknown paths
    return path[0].charAt(0).toUpperCase() + path[0].slice(1);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-20 transition-all duration-200 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left section - Logo and menu toggle */}
          <div className="flex items-center">
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-controls="mobile-menu"
              aria-expanded={isSidebarOpen}
              onClick={toggleSidebar}
            >
              <span className="sr-only">
                {isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              </span>
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center md:ml-0">
              <span className="ml-3 md:ml-0 font-bold text-xl text-gray-900 dark:text-white">
                Airiam
              </span>
            </Link>

            {/* Current page title - shown only on mobile */}
            <div className="ml-4 md:hidden font-medium text-gray-700 dark:text-gray-300">
              {getPageTitle()}
            </div>
          </div>

          {/* Center section - Tenant selector (desktop only) */}
          <div className="hidden md:flex items-center">
            <TenantSelector />
          </div>

          {/* Right section - Actions and user profile */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div id="notifications-menu" className="relative">
              <button
                type="button"
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-expanded={isNotificationsOpen}
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                  {/* Notification badge - only shown when there are notifications */}
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </div>
              </button>

              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Notifications
                    </h3>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      <div className="py-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          You have no unread notifications
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div id="user-menu" className="relative">
              <button
                type="button"
                className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
              >
                <span className="sr-only">Open user menu</span>
                {user ? (
                  <Avatar 
                    name={user.name} 
                    src="" 
                    size="sm" 
                    variant="dynamic" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </button>

              {/* User dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-1">
                    {user && (
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                          {user.role}
                        </p>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        Profile Settings
                      </Link>
                      
                      {/* Show Tenant Management only for admins */}
                      {user?.role === 'admin' && (
                        <Link
                          href="/tenants"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          Tenant Management
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
