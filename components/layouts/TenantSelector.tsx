'use client';

import { useState, useEffect } from 'react';
import { BuildingOfficeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/redux/hooks';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';

// Dummy tenant data - would be fetched from API in a real app
const dummyTenants = [
  { id: 'tenant-1', name: 'Acme Corporation' },
  { id: 'tenant-2', name: 'Wayne Enterprises' },
  { id: 'tenant-3', name: 'Stark Industries' },
];

/**
 * Component for selecting and switching between tenants
 */
export function TenantSelector() {
  const { user, currentTenant, switchTenant } = useAuth();
  const toast = useToast();
  const { loadTenantTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [tenants, setTenants] = useState(dummyTenants);
  const [currentTenantName, setCurrentTenantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Get current tenant name
  useEffect(() => {
    if (currentTenant) {
      const tenant = tenants.find(t => t.id === currentTenant);
      if (tenant) {
        setCurrentTenantName(tenant.name);
      }
    }
  }, [currentTenant, tenants]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('tenant-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fetch available tenants - in a real app this would call an API
  useEffect(() => {
    const fetchTenants = async () => {
      // In a real implementation, we would fetch the user's available tenants
      // For now, we'll just use dummy data
      setTenants(dummyTenants);
    };

    if (user) {
      fetchTenants();
    }
  }, [user]);

  // Handle tenant switch
  const handleTenantSwitch = async (tenantId: string) => {
    try {
      setIsLoading(true);
      
      // Switch tenant in auth state
      await switchTenant(tenantId);
      
      // Load tenant theme
      await loadTenantTheme(tenantId);
      
      // Update UI
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        setCurrentTenantName(tenant.name);
      }
      
      setIsOpen(false);
      toast.success(`Switched to ${tenant?.name}`);
    } catch (error) {
      toast.error('Failed to switch tenant');
    } finally {
      setIsLoading(false);
    }
  };

  // If user only has one tenant, don't show selector
  if (tenants.length <= 1) {
    return (
      <div className="flex items-center">
        <BuildingOfficeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentTenantName || tenants[0]?.name || 'Organization'}
        </span>
      </div>
    );
  }

  return (
    <div id="tenant-dropdown" className="relative">
      <button
        type="button"
        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        disabled={isLoading}
      >
        <BuildingOfficeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
        <span className="truncate max-w-[150px]">
          {currentTenantName || 'Select Organization'}
        </span>
        <ChevronDownIcon className={`h-5 w-5 ml-1 text-gray-500 dark:text-gray-400 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-60 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Your organizations
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    tenant.id === currentTenant
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => tenant.id !== currentTenant && handleTenantSwitch(tenant.id)}
                  disabled={isLoading}
                >
                  <BuildingOfficeIcon
                    className={`h-5 w-5 mr-2 ${
                      tenant.id === currentTenant
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  <span className="flex-1 truncate">{tenant.name}</span>
                  {tenant.id === currentTenant && (
                    <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 ml-2"></span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Option to create a new tenant - visible only for admins */}
            {user?.role === 'admin' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <a
                  href="/tenants/new"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="h-5 w-5 mr-2 flex items-center justify-center text-gray-500 dark:text-gray-400">+</span>
                  <span>Create new organization</span>
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantSelector;