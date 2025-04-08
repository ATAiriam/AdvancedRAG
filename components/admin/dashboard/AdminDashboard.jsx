'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SystemStatusCard from './SystemStatusCard';
import RecentActivityWidget from './RecentActivityWidget';
import QuickActions from './QuickActions';
import ResourceMetricsChart from './ResourceMetricsChart';
import AdminCard from '../common/AdminCard';
import MobileHeader from '../common/MobileHeader';
import { fetchSystemStatus, fetchRecentActivity } from '@/redux/features/admin/adminSlice';
import { trackAdminAction } from '@/lib/admin/hooks/useActionTracking';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { systemStatus, recentActivity, isLoading } = useSelector(state => state.admin);
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

  // Fetch data
  useEffect(() => {
    dispatch(fetchSystemStatus());
    dispatch(fetchRecentActivity({ period: selectedPeriod }));
    
    // Track dashboard view
    trackAdminAction('view_admin_dashboard');
  }, [dispatch, selectedPeriod]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    trackAdminAction('change_dashboard_period', { period });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <MobileHeader title="Admin Dashboard" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">System overview and management</p>
      </div>
      
      {/* Period selector - simplified for mobile */}
      <div className="flex mb-6 overflow-x-auto pb-2">
        {['day', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={`px-4 py-2 mr-2 rounded-lg whitespace-nowrap ${
              selectedPeriod === period
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Status cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array(4).fill().map((_, i) => (
            <AdminCard key={i} className="h-24 animate-pulse bg-gray-200 dark:bg-gray-800" />
          ))
        ) : (
          <>
            <SystemStatusCard 
              title="Active Users" 
              value={systemStatus?.activeUsers || 0} 
              icon="users" 
              trend={systemStatus?.userTrend || 0} 
              isMobile={isMobile}
            />
            <SystemStatusCard 
              title="System Health" 
              value={systemStatus?.healthStatus || 'Unknown'} 
              icon="server" 
              status={systemStatus?.healthStatus?.toLowerCase() || 'unknown'} 
              isMobile={isMobile}
            />
            <SystemStatusCard 
              title="Storage Usage" 
              value={`${systemStatus?.storageUsed || 0}%`} 
              icon="database" 
              progress={systemStatus?.storageUsed || 0} 
              isMobile={isMobile}
            />
            <SystemStatusCard 
              title="API Usage" 
              value={systemStatus?.apiQueries || 0} 
              icon="code" 
              trend={systemStatus?.apiTrend || 0} 
              isMobile={isMobile}
            />
          </>
        )}
      </div>
      
      {/* Main dashboard content - stacked on mobile, side-by-side on larger screens */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <ResourceMetricsChart 
            period={selectedPeriod} 
            isMobile={isMobile} 
          />
        </div>
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <QuickActions isMobile={isMobile} />
          <RecentActivityWidget 
            activities={recentActivity} 
            isLoading={isLoading} 
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
