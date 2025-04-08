'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { fetchUsers } from '@/redux/features/admin/userSlice';
import { trackAdminAction } from '@/lib/admin/hooks/useActionTracking';
import UserCard from './UserCard';
import AdminCard from '../common/AdminCard';
import FilterBar from '../common/FilterBar';
import ConfirmDialog from '../common/ConfirmDialog';
import MobileHeader from '../common/MobileHeader';
import UserDetail from './UserDetail';

const UserList = () => {
  const dispatch = useDispatch();
  const { users, isLoading, total, currentPage, limit } = useSelector(state => state.users);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ role: 'all', status: 'all' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null });
  const [selectedUser, setSelectedUser] = useState(null);
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

  // Fetch users with pagination and filters
  useEffect(() => {
    dispatch(fetchUsers({ 
      page: currentPage, 
      limit, 
      search: searchTerm,
      ...filters 
    }));
    trackAdminAction('view_user_list');
  }, [dispatch, currentPage, limit, searchTerm, filters]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    trackAdminAction('filter_users', newFilters);
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchUsers({ 
      page: newPage, 
      limit, 
      search: searchTerm,
      ...filters 
    }));
    trackAdminAction('change_user_page', { page: newPage });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    trackAdminAction('view_user_details', { userId: user.id });
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const handleDeleteClick = (userId) => {
    setDeleteConfirm({ show: true, userId });
  };

  const confirmDelete = async () => {
    try {
      // Implementation of user deletion would go here
      trackAdminAction('delete_user', { userId: deleteConfirm.userId });
      setDeleteConfirm({ show: false, userId: null });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(startItem + limit - 1, total);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <MobileHeader title="User Management" />
      
      {/* Detail panel for mobile - full screen sliding panel */}
      {isMobile && selectedUser && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-20 overflow-auto">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <button 
              onClick={handleCloseDetail}
              className="mr-2 p-1 rounded-full text-gray-500 dark:text-gray-400"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-medium">User Details</h2>
          </div>
          <UserDetail 
            user={selectedUser} 
            onClose={handleCloseDetail}
            onDelete={() => handleDeleteClick(selectedUser.id)}
            isMobile={true}
          />
        </div>
      )}
      
      {/* Main content when not viewing user detail on mobile */}
      {!(isMobile && selectedUser) && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">User Management</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage users and their permissions</p>
            </div>
            
            {/* Action button - fixed position on mobile */}
            <div className={`${isMobile ? 'fixed bottom-4 right-4 z-10' : 'mt-4 sm:mt-0'}`}>
              <Link 
                href="/admin/users/new" 
                className={`
                  inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm
                  ${isMobile ? 'rounded-full w-14 h-14 justify-center' : ''}
                `}
                onClick={() => trackAdminAction('click_create_user')}
              >
                <PlusIcon className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5 mr-2'}`} />
                {!isMobile && <span>Add User</span>}
              </Link>
            </div>
          </div>
          
          {/* Search and filters - adaptable for mobile */}
          <div className="flex flex-col sm:flex-row mb-6 gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700
                        rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {!isMobile && <span className="ml-2">Filters</span>}
              {filters.role !== 'all' || filters.status !== 'all' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          </div>
          
          {/* Filter bar - collapsible */}
          {showFilters && (
            <FilterBar 
              filters={filters}
              onFilterChange={handleFilterChange}
              options={{
                role: [
                  { value: 'all', label: 'All Roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'contributor', label: 'Contributor' },
                  { value: 'reviewer', label: 'Reviewer' },
                  { value: 'viewer', label: 'Viewer' }
                ],
                status: [
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]
              }}
              isMobile={isMobile}
            />
          )}
          
          {/* User list - responsive layout */}
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill().map((_, i) => (
                <AdminCard key={i} className="h-20 animate-pulse bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={() => handleViewUser(user)}
                  onDelete={() => handleDeleteClick(user.id)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            <AdminCard className="py-12 text-center">
              <div className="mx-auto max-w-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No users found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {searchTerm || filters.role !== 'all' || filters.status !== 'all'
                    ? "No users match your search criteria. Try adjusting your filters."
                    : "No users have been created yet. Create your first user to get started."}
                </p>
                {!(searchTerm || filters.role !== 'all' || filters.status !== 'all') && (
                  <div className="mt-6">
                    <Link
                      href="/admin/users/new"
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      <span>Add User</span>
                    </Link>
                  </div>
                )}
              </div>
            </AdminCard>
          )}
          
          {/* Pagination - larger touch targets for mobile */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-0 mt-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{total}</span> users
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 
                                 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                   currentPage === 1 
                                     ? 'opacity-50 cursor-not-allowed' 
                                     : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                 }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers - simplified for mobile */}
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      
                      // Logic to show appropriate page numbers
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                        if (i === 4) pageNum = totalPages;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                        if (i === 0) pageNum = 1;
                      } else {
                        pageNum = currentPage - 2 + i;
                        if (i === 0) pageNum = 1;
                        if (i === 4) pageNum = totalPages;
                      }
                      
                      // Separator dots
                      if ((i === 1 && pageNum !== 2) || (i === 3 && pageNum !== totalPages - 1)) {
                        return (
                          <span
                            key={i}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300
                                      ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-offset-0"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                                    ${currentPage === pageNum 
                                      ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' 
                                      : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    } focus:z-20 focus:outline-offset-0`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300
                                dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                  currentPage === totalPages 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Simplified mobile pagination */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium 
                            ${currentPage === 1 
                              ? 'text-gray-400 opacity-50 cursor-not-allowed' 
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300 self-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
                            ${currentPage === totalPages 
                              ? 'text-gray-400 opacity-50 cursor-not-allowed' 
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <ConfirmDialog
          title="Delete User"
          message="Are you sure you want to delete this user? This action is permanent and will remove all their data."
          confirmLabel="Delete User"
          cancelLabel="Cancel"
          danger={true}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, userId: null })}
          isMobile={isMobile}
        />
      )}
      
      {/* User detail panel - side panel for desktop */}
      {!isMobile && selectedUser && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-lg z-10 overflow-auto border-l border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-medium">User Details</h2>
            <button 
              onClick={handleCloseDetail}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <UserDetail 
            user={selectedUser} 
            onClose={handleCloseDetail}
            onDelete={() => handleDeleteClick(selectedUser.id)}
            isMobile={false}
          />
        </div>
      )}
    </div>
  );
};

export default UserList;
