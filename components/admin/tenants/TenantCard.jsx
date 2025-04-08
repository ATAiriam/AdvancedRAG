import { useState } from 'react';
import { 
  EllipsisVerticalIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  CalendarIcon,
  ServerIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AdminCard from '../common/AdminCard';
import Image from 'next/image';
import { formatDate } from '@/lib/admin/utils/formatters';

const TenantCard = ({ tenant, viewMode, onView, onDelete, isMobile }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    setMenuOpen(false);
    
    if (action === 'view') onView();
    if (action === 'delete') onDelete();
  };

  // Function to render appropriate status badge
  const StatusBadge = ({ status }) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (status === 'active') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
          Active
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`}>
          Inactive
        </span>
      );
    }
  };

  // Grid mode card for desktop
  if (viewMode === 'grid') {
    return (
      <AdminCard className="cursor-pointer group hover:border-primary overflow-hidden flex flex-col" onClick={onView}>
        {/* Color accent based on tenant theme */}
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: tenant.theme?.primaryColor || '#6366f1' }}
        />
        
        <div className="p-4 relative flex-grow">
          {/* Tenant logo or placeholder */}
          <div className="absolute right-4 top-4">
            <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              {tenant.theme?.logoUrl ? (
                <Image
                  src={tenant.theme.logoUrl}
                  fill
                  alt={`${tenant.name} logo`}
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <GlobeAltIcon className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
          
          {/* Tenant name and domain */}
          <div className="mb-4 pr-14">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{tenant.name}</h3>
            {tenant.domain && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{tenant.domain}</p>
            )}
          </div>
          
          {/* Status badge */}
          <div className="mb-3">
            <StatusBadge status={tenant.isActive ? 'active' : 'inactive'} />
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>{tenant.userCount || 0} Users</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Created {formatDate(tenant.createdAt)}</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300 col-span-2 mt-1">
              <ServerIcon className="h-4 w-4 mr-1" />
              <span>{tenant.storageUsed || '0%'} Storage Used</span>
            </div>
          </div>
          
          {/* Action buttons - appear on hover */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <button
                onClick={(e) => handleAction('view', e)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                          dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleAction('edit', e)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                          dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleAction('delete', e)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                          dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </AdminCard>
    );
  }
  
  // List mode for mobile or desktop list view
  return (
    <AdminCard className="cursor-pointer hover:border-primary overflow-hidden" onClick={onView}>
      <div className="flex items-center p-4">
        {/* Tenant logo or placeholder */}
        <div className="flex-shrink-0 mr-4">
          <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
            {tenant.theme?.logoUrl ? (
              <Image
                src={tenant.theme.logoUrl}
                fill
                alt={`${tenant.name} logo`}
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <GlobeAltIcon className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {tenant.name}
              </h3>
              {tenant.domain && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {tenant.domain}
                </p>
              )}
            </div>
            <StatusBadge status={tenant.isActive ? 'active' : 'inactive'} />
          </div>
          
          {/* Key metrics - responsive layout */}
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-sm">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>{tenant.userCount || 0} Users</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <ServerIcon className="h-4 w-4 mr-1" />
              <span>{tenant.storageUsed || '0%'} Used</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Created {formatDate(tenant.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {/* Actions menu - touch-friendly */}
        <div className="ml-4 relative flex-shrink-0">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <button
                  onClick={(e) => handleAction('view', e)}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <TrashIcon className="h-4 w-4 mr-3" />
                    Delete Tenant
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminCard>
  );
};

export default TenantCard;-center">
                    <EyeIcon className="h-4 w-4 mr-3" />
                    View Details
                  </div>
                </button>
                <button
                  onClick={(e) => handleAction('edit', e)}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <PencilIcon className="h-4 w-4 mr-3" />
                    Edit Tenant
                  </div>
                </button>
                <button
                  onClick={(e) => handleAction('delete', e)}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items