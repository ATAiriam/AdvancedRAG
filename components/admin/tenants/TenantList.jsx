'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { fetchTenants } from '@/redux/features/admin/tenantSlice';
import { trackAdminAction } from '@/lib/admin/hooks/useActionTracking';
import TenantCard from './TenantCard';
import AdminCard from '../common/AdminCard';
import FilterBar from '../common/FilterBar';
import ConfirmDialog from '../common/ConfirmDialog';
import MobileHeader from '../common/MobileHeader';

const TenantList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { tenants, isLoading } = useSelector(state => state.tenants);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: 'all' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, tenantId: null });
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Default to list view on mobile
      if (window.innerWidth < 640 && viewMode === 'grid') {
        setViewMode('list');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // Fetch tenants with optional filters
  useEffect(() => {
    dispatch(fetchTenants({ ...filters }));
    trackAdminAction('view_tenant_list');
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    trackAdminAction('filter_tenants', newFilters);
  };

  const handleViewTenant = (tenantId) => {
    router.push(`/admin/tenants/${tenantId}`);
    trackAdminAction('view_tenant_details', { tenantId });
  };

  const handleDeleteClick = (tenantId) => {
    setDeleteConfirm({ show: true, tenantId });
  };

  const confirmDelete = async () => {
    try {
      // Implementation of tenant deletion would go here
      trackAdminAction('delete_tenant', { tenantId: deleteConfirm.tenantId });
      setDeleteConfirm({ show: false, tenantId: null });
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  // Filter tenants by search term
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenant.domain && tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <MobileHeader title="Tenant Management" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Tenant Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage organizations and their settings</p>
        </div>
        
        {/* Action button - fixed position on mobile */}
        <div className={`${isMobile ? 'fixed bottom-4 right-4 z-10' : 'mt-4 sm:mt-0'}`}>
          <Link 
            href="/admin/tenants/new" 
            className={`
              inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm
              ${isMobile ? 'rounded-full w-14 h-14 justify-center' : ''}
            `}
            onClick={() => trackAdminAction('click_create_tenant')}
          >
            <PlusIcon className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5 mr-2'}`} />
            {!isMobile && <span>Add Tenant</span>}
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
            placeholder="Search tenants..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700
                      rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            {!isMobile && <span className="ml-2">Filters</span>}
          </button>
          
          {!isMobile && (
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : 'bg-white dark:bg-gray-800'}`}
              >
                <ViewColumnsIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : 'bg-white dark:bg-gray-800'}`}
              >
                <ListBulletIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Filter bar - collapsible */}
      {showFilters && (
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          options={{
            status: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }}
          isMobile={isMobile}
        />
      )}
      
      {/* Tenants list/grid - responsive layout */}
      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {Array(6).fill().map((_, i) => (
            <AdminCard key={i} className="h-40 animate-pulse bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : filteredTenants.length > 0 ? (
        <div className={viewMode === 'grid' && !isMobile
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredTenants.map(tenant => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              viewMode={isMobile ? 'list' : viewMode}
              onView={() => handleViewTenant(tenant.id)}
              onDelete={() => handleDeleteClick(tenant.id)}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <AdminCard className="py-12 text-center">
          <div className="mx-auto max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No tenants found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? `No tenants match "${searchTerm}". Try a different search term or clear filters.` 
                : "No tenants have been created yet. Create your first tenant to get started."}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/admin/tenants/new"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  <span>Add Tenant</span>
                </Link>
              </div>
            )}
          </div>
        </AdminCard>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <ConfirmDialog
          title="Delete Tenant"
          message="Are you sure you want to delete this tenant? This action is permanent and will remove all associated data including users, files, and conversations."
          confirmLabel="Delete Tenant"
          cancelLabel="Cancel"
          danger={true}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, tenantId: null })}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default TenantList;
