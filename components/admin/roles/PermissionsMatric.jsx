'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckIcon, 
  XMarkIcon, 
  PlusIcon,
  ChevronDownIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { fetchRoles, updateRolePermissions } from '@/redux/features/admin/rolesSlice';
import AdminCard from '../common/AdminCard';
import MobileHeader from '../common/MobileHeader';
import { trackAdminAction } from '@/lib/admin/hooks/useActionTracking';

const PermissionsMatrix = () => {
  const dispatch = useDispatch();
  const { roles, permissions, isLoading } = useSelector(state => state.roles);
  
  const [expandedSections, setExpandedSections] = useState({});
  const [activeRole, setActiveRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch roles and permissions data
  useEffect(() => {
    dispatch(fetchRoles());
    trackAdminAction('view_permissions_matrix');
  }, [dispatch]);
  
  // Set initial expanded state for permission categories
  useEffect(() => {
    if (permissions.length > 0) {
      const categories = [...new Set(permissions.map(p => p.category))];
      const initialExpandedState = categories.reduce((acc, category) => {
        acc[category] = !isMobile; // Expand all on desktop, collapse all on mobile
        return acc;
      }, {});
      setExpandedSections(initialExpandedState);
    }
  }, [permissions, isMobile]);
  
  // Set initial role permissions when roles are loaded
  useEffect(() => {
    if (roles.length > 0 && !activeRole) {
      const adminRole = roles.find(r => r.name === 'admin') || roles[0];
      setActiveRole(adminRole);
      
      // Initialize rolePermissions state
      const initialPermissions = {};
      roles.forEach(role => {
        initialPermissions[role.id] = role.permissions || [];
      });
      setRolePermissions(initialPermissions);
    }
  }, [roles, activeRole]);
  
  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const handleRoleChange = (role) => {
    setActiveRole(role);
    trackAdminAction('change_active_role', { roleId: role.id });
  };
  
  const togglePermission = (permissionId) => {
    if (!activeRole) return;
    
    setRolePermissions(prev => {
      const roleId = activeRole.id;
      const currentPermissions = [...(prev[roleId] || [])];
      
      if (currentPermissions.includes(permissionId)) {
        return {
          ...prev,
          [roleId]: currentPermissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          [roleId]: [...currentPermissions, permissionId]
        };
      }
    });
    
    trackAdminAction('toggle_permission', { roleId: activeRole.id, permissionId });
  };
  
  const savePermissions = async () => {
    if (!activeRole) return;
    
    setSaveStatus('saving');
    
    try {
      await dispatch(updateRolePermissions({
        roleId: activeRole.id,
        permissions: rolePermissions[activeRole.id] || []
      })).unwrap();
      
      setSaveStatus('success');
      trackAdminAction('save_role_permissions', { roleId: activeRole.id });
      
      // Reset status after showing success
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save permissions:', error);
      
      // Reset status after showing error
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});
  
  // Determine if permission is active for current role
  const hasPermission = (permissionId) => {
    if (!activeRole) return false;
    return (rolePermissions[activeRole.id] || []).includes(permissionId);
  };
  
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
};

export default PermissionsMatrix;
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <MobileHeader title="Role Permissions" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Role Permissions</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure access control for each role</p>
        </div>
        
        {/* Save button for desktop */}
        {!isMobile && activeRole && (
          <button
            onClick={savePermissions}
            disabled={saveStatus === 'saving'}
            className={`
              px-4 py-2 rounded-lg text-white
              ${saveStatus === 'saving' ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary-dark'}
              mt-4 sm:mt-0
            `}
          >
            {saveStatus === 'saving' ? (
              <div className="flex items-center">
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </div>
            ) : saveStatus === 'success' ? (
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2" />
                Saved!
              </div>
            ) : saveStatus === 'error' ? (
              <div className="flex items-center">
                <XMarkIcon className="h-4 w-4 mr-2" />
                Failed
              </div>
            ) : (
              'Save Permissions'
            )}
          </button>
        )}
      </div>
      
      {/* Role selector - swipe cards on mobile, tabs on desktop */}
      <div className="mb-6">
        {isMobile ? (
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap
                  ${activeRole?.id === role.id 
                    ? 'border-primary bg-primary bg-opacity-10 text-primary dark:text-primary-light' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}
                `}
              >
                {role.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="-mb-px flex space-x-8">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role)}
                  className={`
                    py-2 px-1 border-b-2 text-sm font-medium
                    ${activeRole?.id === role.id 
                      ? 'border-primary text-primary dark:text-primary-light' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}
                    whitespace-nowrap
                  `}
                >
                  {role.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
      
      {/* Role description */}
      {activeRole && (
        <AdminCard className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-2">{activeRole.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {activeRole.description || `Default ${activeRole.name} role with standard permissions.`}
            </p>
          </div>
        </AdminCard>
      )}
      
      {/* Permissions matrix */}
      {activeRole && Object.entries(permissionsByCategory).map(([category, perms]) => (
        <AdminCard key={category} className="mb-4">
          {/* Category header - collapsible on mobile */}
          <div 
            className="p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer"
            onClick={() => toggleSection(category)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 capitalize">
                {category} Permissions
              </h3>
              <ChevronDownIcon 
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedSections[category] ? 'transform rotate-180' : ''
                }`} 
              />
            </div>
          </div>
          
          {/* Permission items */}
          {expandedSections[category] && (
            <div className={`p-4 ${isMobile ? 'space-y-4' : ''}`}>
              {isMobile ? (
                // Mobile view - stacked list
                <div className="space-y-3">
                  {perms.map(permission => (
                    <div 
                      key={permission.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {permission.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => togglePermission(permission.id)}
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                            border-2 border-transparent transition-colors duration-200 ease-in-out 
                            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                            ${hasPermission(permission.id) ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                          `}
                          role="switch"
                          aria-checked={hasPermission(permission.id)}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full 
                              bg-white shadow ring-0 transition duration-200 ease-in-out
                              ${hasPermission(permission.id) ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop view - table
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Permission
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Enabled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                    {perms.map(permission => (
                      <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {permission.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </td>
                        <td className="px-3 py-4 text-sm text-center">
                          <button
                            onClick={() => togglePermission(permission.id)}
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                              border-2 border-transparent transition-colors duration-200 ease-in-out 
                              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                              ${hasPermission(permission.id) ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                            `}
                            role="switch"
                            aria-checked={hasPermission(permission.id)}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full 
                                bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${hasPermission(permission.id) ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {/* Common permission actions */}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800 text-sm">
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="text-primary dark:text-primary-light hover:underline flex items-center"
                    onClick={() => {
                      // Select all permissions in category
                      const permIds = perms.map(p => p.id);
                      setRolePermissions(prev => {
                        const roleId = activeRole.id;
                        const currentPermissions = [...(prev[roleId] || [])];
                        const newPermissions = [...new Set([...currentPermissions, ...permIds])];
                        
                        return {
                          ...prev,
                          [roleId]: newPermissions
                        };
                      });
                      trackAdminAction('select_all_category_permissions', { category, roleId: activeRole.id });
                    }}
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Select All
                  </button>
                  <button 
                    className="text-gray-700 dark:text-gray-300 hover:underline flex items-center"
                    onClick={() => {
                      // Deselect all permissions in category
                      const permIds = perms.map(p => p.id);
                      setRolePermissions(prev => {
                        const roleId = activeRole.id;
                        const currentPermissions = [...(prev[roleId] || [])];
                        const newPermissions = currentPermissions.filter(id => !permIds.includes(id));
                        
                        return {
                          ...prev,
                          [roleId]: newPermissions
                        };
                      });
                      trackAdminAction('deselect_all_category_permissions', { category, roleId: activeRole.id });
                    }}
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Deselect All
                  </button>
                </div>
              </div>
            </div>
          )}
        </AdminCard>
      ))}
      
      {/* Commonly used permission sets */}
      <AdminCard className="mb-6">
        <div className="p-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
            Common Permission Sets
          </h3>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'}`}>
            {[
              { 
                name: 'Read-only Access', 
                icon: EyeIcon,
                description: 'View-only permissions for all data' 
              },
              { 
                name: 'Editor Access', 
                icon: PencilSquareIcon,
                description: 'Create and edit content, no deletion' 
              },
              { 
                name: 'Full Access', 
                icon: TrashIcon,
                description: 'Complete access including deletion' 
              }
            ].map(template => (
              <button
                key={template.name}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  // Would apply template permissions in real implementation
                  trackAdminAction('apply_permission_template', { template: template.name, roleId: activeRole?.id });
                }}
              >
                <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 mr-3">
                  <template.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {template.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {template.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </AdminCard>
      
      {/* Save button for mobile - fixed at bottom */}
      {isMobile && activeRole && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-center">
          <button
            onClick={savePermissions}
            disabled={saveStatus === 'saving'}
            className={`
              px-4 py-3 w-full rounded-lg text-white
              ${saveStatus === 'saving' ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary-dark'}
            `}
          >
            {saveStatus === 'saving' ? (
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </div>
            ) : saveStatus === 'success' ? (
              <div className="flex items-center justify-center">
                <CheckIcon className="h-5 w-5 mr-2" />
                Saved!
              </div>
            ) : saveStatus === 'error' ? (
              <div className="flex items-center justify-center">
                <XMarkIcon className="h-5 w-5 mr-2" />
                Failed
              </div>
            ) : (
              'Save Permissions'
            )}
          </button>
        </div>
      )}
    </div>
  );