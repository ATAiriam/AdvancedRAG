'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/redux/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import TenantSelector from './TenantSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar navigation component with mobile support
 * Collapses to bottom bar on mobile
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeItem, setActiveItem] = useState('');

  // Update active item based on pathname
  useEffect(() => {
    const path = pathname.split('/')[1];
    setActiveItem(path || 'dashboard');
  }, [pathname]);

  // Update mobile view state
  useEffect(() => {
    setIsMobileView(isMobile);
  }, [isMobile]);

  // Navigation items with access control
  const navigationItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      href: '/dashboard',
      active: activeItem === 'dashboard',
      requiredRole: ['admin', 'contributor', 'reviewer', 'viewer'],
    },
    {
      name: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      active: activeItem === 'chat',
      requiredRole: ['admin', 'contributor', 'reviewer', 'viewer'],
    },
    {
      name: 'Files',
      icon: DocumentTextIcon,
      href: '/files',
      active: activeItem === 'files',
      requiredRole: ['admin', 'contributor', 'reviewer', 'viewer'],
    },
    {
      name: 'Analytics',
      icon: ChartBarIcon,
      href: '/analytics',
      active: activeItem === 'analytics',
      requiredRole: ['admin', 'contributor'],
    },
    {
      name: 'Users',
      icon: UserGroupIcon,
      href: '/users',
      active: activeItem === 'users',
      requiredRole: ['admin'],
    },
    {
      name: 'Tenants',
      icon: BuildingOfficeIcon,
      href: '/tenants',
      active: activeItem === 'tenants',
      requiredRole: ['admin'],
    },
    {
      name: 'Settings',
      icon: Cog6ToothIcon,
      href: '/settings',
      active: activeItem === 'settings',
      requiredRole: ['admin', 'contributor', 'reviewer', 'viewer'],
    },
  ];

  // Filter items based on user role
  const filteredItems = navigationItems.filter(item => {
    if (!user) return false;
    return hasRole(item.requiredRole);
  });

  // Render mobile bottom bar
  if (isMobileView) {
    return (
      <div className="fixed bottom-0 left-0 z-20 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex justify-around items-center h-16">
          {filteredItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 ${
                item.active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              onClick={onClose}
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Render desktop sidebar or mobile slide-over
  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileView && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/80 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
          isOpen || !isMobileView ? 'translate-x-0' : '-translate-x-full'
        } ${isMobileView ? 'md:hidden pt-16' : 'hidden md:block pt-20'}`}
      >
        {/* Close button - only on mobile */}
        {isMobileView && (
          <button
            className="absolute top-4 right-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}

        {/* Tenant selector - only on mobile */}
        {isMobileView && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <TenantSelector />
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex flex-col h-full">
          <div className="flex-1 space-y-1 px-2 py-4">
            {filteredItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  item.active
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={onClose}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    item.active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Footer section */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Airiam RAG Service</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
