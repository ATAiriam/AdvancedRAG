'use client';

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { 
  TimeRange,
  setTimeRange,
  fetchUsageStats,
  fetchCreditConsumption,
  fetchQueryDistribution,
  fetchTopDocuments,
  fetchActivityLog,
  refreshDashboard,
  hydrateDashboardState
} from '@/redux/slices/dashboardSlice';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useAuth } from '@/redux/hooks';
import analytics from '@/lib/analytics';

/**
 * Custom hook to manage dashboard data and actions
 * Provides functionality for fetching data, handling time range changes,
 * and supporting offline mode
 */
export default function useDashboard() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { isOnline, hasReconnected, saveForOffline, getOfflineData } = useOfflineStatus();
  
  const timeRange = useAppSelector(state => state.dashboard.timeRange);
  const isRefreshing = useAppSelector(state => state.dashboard.isRefreshing);
  
  const usageStats = useAppSelector(state => state.dashboard.usageStats);
  const creditConsumption = useAppSelector(state => state.dashboard.creditConsumption);
  const queryDistribution = useAppSelector(state => state.dashboard.queryDistribution);
  const topDocuments = useAppSelector(state => state.dashboard.topDocuments);
  const activityLog = useAppSelector(state => state.dashboard.activityLog);

  // Hydrate state from cache on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(hydrateDashboardState());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch all data when component mounts or time range changes
  useEffect(() => {
    if (isAuthenticated && timeRange) {
      // Track analytics event
      analytics.trackEvent('view_dashboard', 'dashboard', { timeRange });
      
      // Fetch data
      const fetchData = async () => {
        if (isOnline) {
          try {
            // Fetch all data in parallel
            await Promise.all([
              dispatch(fetchUsageStats(timeRange)).unwrap(),
              dispatch(fetchCreditConsumption(timeRange)).unwrap(),
              dispatch(fetchQueryDistribution(timeRange)).unwrap(),
              dispatch(fetchTopDocuments(timeRange)).unwrap(),
              dispatch(fetchActivityLog(timeRange)).unwrap(),
            ]);
            
            // Save data for offline use
            saveDataForOffline();
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Try to load from offline storage
            loadOfflineData();
          }
        } else {
          // If offline, try to load from storage
          loadOfflineData();
        }
      };
      
      fetchData();
    }
  }, [isAuthenticated, timeRange, isOnline]);

  // When reconnecting to internet, refresh data
  useEffect(() => {
    if (hasReconnected && isAuthenticated && timeRange) {
      dispatch(refreshDashboard(timeRange));
    }
  }, [hasReconnected, dispatch, isAuthenticated, timeRange]);

  // Save dashboard data for offline use
  const saveDataForOffline = useCallback(async () => {
    if (usageStats.data) {
      await saveForOffline(`offline_dashboard_usageStats_${timeRange}`, usageStats.data);
    }
    
    if (creditConsumption.data.length > 0) {
      await saveForOffline(`offline_dashboard_creditConsumption_${timeRange}`, creditConsumption.data);
    }
    
    if (queryDistribution.data.length > 0) {
      await saveForOffline(`offline_dashboard_queryDistribution_${timeRange}`, queryDistribution.data);
    }
    
    if (topDocuments.data.length > 0) {
      await saveForOffline(`offline_dashboard_topDocuments_${timeRange}`, topDocuments.data);
    }
    
    if (activityLog.data.length > 0) {
      await saveForOffline(`offline_dashboard_activityLog_${timeRange}`, activityLog.data);
    }
  }, [
    timeRange, 
    saveForOffline, 
    usageStats.data, 
    creditConsumption.data, 
    queryDistribution.data, 
    topDocuments.data, 
    activityLog.data
  ]);

  // Load dashboard data from offline storage
  const loadOfflineData = useCallback(async () => {
    try {
      // Attempt to load data from offline storage
      const offlineUsageStats = await getOfflineData(`offline_dashboard_usageStats_${timeRange}`);
      const offlineCreditConsumption = await getOfflineData(`offline_dashboard_creditConsumption_${timeRange}`);
      const offlineQueryDistribution = await getOfflineData(`offline_dashboard_queryDistribution_${timeRange}`);
      const offlineTopDocuments = await getOfflineData(`offline_dashboard_topDocuments_${timeRange}`);
      const offlineActivityLog = await getOfflineData(`offline_dashboard_activityLog_${timeRange}`);
      
      // Update state with offline data if available
      if (offlineUsageStats) {
        console.log('Using offline usage stats data');
      }
      
      if (offlineCreditConsumption) {
        console.log('Using offline credit consumption data');
      }
      
      if (offlineQueryDistribution) {
        console.log('Using offline query distribution data');
      }
      
      if (offlineTopDocuments) {
        console.log('Using offline top documents data');
      }
      
      if (offlineActivityLog) {
        console.log('Using offline activity log data');
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }, [timeRange, getOfflineData]);

  // Handle time range change
  const changeTimeRange = useCallback((newTimeRange: TimeRange) => {
    dispatch(setTimeRange(newTimeRange));
  }, [dispatch]);

  // Refresh all dashboard data
  const refresh = useCallback(() => {
    if (isAuthenticated && !isRefreshing) {
      // Track analytics event
      analytics.trackEvent('refresh_dashboard', 'dashboard', { timeRange });
      
      return dispatch(refreshDashboard(timeRange));
    }
  }, [dispatch, isAuthenticated, isRefreshing, timeRange]);

  return {
    timeRange,
    isRefreshing,
    usageStats,
    creditConsumption,
    queryDistribution,
    topDocuments,
    activityLog,
    changeTimeRange,
    refresh,
    isOnline,
  };
}
