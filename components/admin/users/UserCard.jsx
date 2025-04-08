import { 
  EllipsisVerticalIcon, 
  PencilIcon,
  TrashIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import AdminCard from '../common/AdminCard';
import { formatDate } from '@/lib/admin/utils/formatters';

const UserCard = ({ user, onClick, onEdit, onDelete, onResetPassword, isMobile }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    setMenuOpen(false);
    
    if (action === 'edit' && onEdit) onEdit();
    if (action === 'delete' && onDelete) onDelete();
    if (action === 'reset' && onResetPassword) onResetPassword();
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to render role badge
  const RoleBadge = ({ role }) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    // Color mapping for different roles
    const colorMap = {
      admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      contributor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      reviewer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    };
    
    const colors = colorMap[role.toLowerCase()] || colorMap.viewer;
    
    return (
      <span className={`${baseClasses} ${colors}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  // Function to render status indicator
  const StatusIndicator = ({ isActive }) => {
    return (
      <span className="flex items-center">
        <span className={`h-2.5 w-2.5 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </span>
    );
  };

  return (
    <AdminCard 
      className="cursor-pointer hover:border-primary overflow-hidden transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center p-4">
        {/* User avatar */}
        <div className="flex-shrink-0 mr-4">
          <div className={`
            flex items-center justify-center 
            ${isMobile ? 'h-12 w-12' : 'h-14 w-14'} 
            bg-gray-200 dark:bg-gray-700 rounded-full 
            text-gray-700 dark:text-gray-200 
            text-lg font-medium
          `}>
            {getInitials(user.name)}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            
            {/* Role badge - show in different positions based on viewport */}
            <div className={`${isMobile ? 'mt-2' : ''}`}>
              <RoleBadge role={user.role} />
            </div>
          </div>
          
          {/* Additional user information */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <StatusIndicator isActive={user.isActive !== false} />
            
            {/* Conditionally show more details on larger screens */}
            {!isMobile && (
              <>
                <span className="text-gray-700 dark:text-gray-300">
                  Tenant: {user.tenantName || 'Global'}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Created: {formatDate(user.createdAt)}
                </span>
                {user.lastLogin && (
                  <span className="text-gray-700 dark:text-gray-300">
                    Last login: {formatDate(user.lastLogin)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Actions menu - larger touch targets for mobile */}
        <div className="ml-4 relative flex-shrink-0">
          <button
            onClick={toggleMenu}
            className={`
              ${isMobile ? 'p-3' : 'p-2'} 
              rounded-full text-gray-400 hover:text-gray-500 
              dark:hover:text-gray-300 hover:bg-gray-100 
              dark:hover:bg-gray-800
            `}
            aria-label="User options"
          >
            <EllipsisVerticalIcon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
          </button>
          
          {menuOpen && (
            <div 
              className={`
                absolute right-0 z-10 mt-2 
                ${isMobile ? 'w-56' : 'w-48'} 
                origin-top-right rounded-md bg-white 
                dark:bg-gray-800 shadow-lg ring-1 
                ring-black ring-opacity-5 focus:outline-none
              `}
            >
              <div className="py-1">
                {onEdit && (
                  <button
                    onClick={(e) => handleAction('edit', e)}
                    className={`
                      block w-full text-left 
                      ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} 
                      text-sm text-gray-700 dark:text-gray-200 
                      hover:bg-gray-100 dark:hover:bg-gray-700
                    `}
                  >
                    <div className="flex items-center">
                      <PencilIcon className={`${isMobile ? 'h-5 w-5 mr-3' : 'h-4 w-4 mr-3'}`} />
                      Edit User
                    </div>
                  </button>
                )}
                
                {onResetPassword && (
                  <button
                    onClick={(e) => handleAction('reset', e)}
                    className={`
                      block w-full text-left 
                      ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} 
                      text-sm text-gray-700 dark:text-gray-200 
                      hover:bg-gray-100 dark:hover:bg-gray-700
                    `}
                  >
                    <div className="flex items-center">
                      <KeyIcon className={`${isMobile ? 'h-5 w-5 mr-3' : 'h-4 w-4 mr-3'}`} />
                      Reset Password
                    </div>
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={(e) => handleAction('delete', e)}
                    className={`
                      block w-full text-left 
                      ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} 
                      text-sm text-red-600 dark:text-red-400 
                      hover:bg-gray-100 dark:hover:bg-gray-700
                    `}
                  >
                    <div className="flex items-center">
                      <TrashIcon className={`${isMobile ? 'h-5 w-5 mr-3' : 'h-4 w-4 mr-3'}`} />
                      Delete User
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminCard>
  );
};

export default UserCard;
