import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setCache, getCache } from '@/lib/cache';
import axios from '@/lib/api';
import analytics from '@/lib/analytics';

// Types
export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface UsageStats {
  totalQueries: number;
  totalFiles: number;
  totalTokensConsumed: number;
  averageResponseTime: number;
}

export interface CreditConsumption {
  date: string;
  credits: number;
}

export interface QueryDistribution {
  category: string;
  count: number;
}

export interface TopDocument {
  id: string;
  name: string;
  type: string;
  accessCount: number;
}

export interface ActivityLogEntry {
  id: string;
  type: 'file_upload' | 'file_delete' | 'conversation_create' | 'conversation_message' | 'login' | 'logout';
  username: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardState {
  timeRange: TimeRange;
  usageStats: {
    data: UsageStats | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  creditConsumption: {
    data: CreditConsumption[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  queryDistribution: {
    data: QueryDistribution[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  topDocuments: {
    data: TopDocument[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  activityLog: {
    data: ActivityLogEntry[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  isRefreshing: boolean;
}

// Cache keys
const TIME_RANGE_KEY = 'dashboard_time_range';
const USAGE_STATS_KEY = 'dashboard_usage_stats';
const CREDIT_CONSUMPTION_KEY = 'dashboard_credit_consumption';
const QUERY_DISTRIBUTION_KEY = 'dashboard_query_distribution';
const TOP_DOCUMENTS_KEY = 'dashboard_top_documents';
const ACTIVITY_LOG_KEY = 'dashboard_activity_log';

// Cache TTL in milliseconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to check if cache is still valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_TTL;
};

// Async thunks
export const fetchUsageStats = createAsyncThunk<
  UsageStats,
  TimeRange,
  { rejectValue: string }
>('dashboard/fetchUsageStats', async (timeRange, { rejectWithValue }) => {
  try {
    // Track analytics event
    analytics.trackEvent('fetch_usage_stats', 'dashboard', { timeRange });
    
    // Try to get from cache first
    const cacheKey = `${USAGE_STATS_KEY}_${timeRange}`;
    const cachedData = await getCache<{ data: UsageStats; timestamp: number }>(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // Fetch from API if no valid cache
    const response = await axios.get<UsageStats>(`/analytics/usage-stats?range=${timeRange}`);
    
    // Cache the response
    await setCache(cacheKey, { 
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error: any) {
    // Track error
    analytics.trackError(`Error fetching usage stats: ${error.message}`, false);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to fetch usage statistics'
    );
  }
});

export const fetchCreditConsumption = createAsyncThunk<
  CreditConsumption[],
  TimeRange,
  { rejectValue: string }
>('dashboard/fetchCreditConsumption', async (timeRange, { rejectWithValue }) => {
  try {
    // Track analytics event
    analytics.trackEvent('fetch_credit_consumption', 'dashboard', { timeRange });
    
    // Try to get from cache first
    const cacheKey = `${CREDIT_CONSUMPTION_KEY}_${timeRange}`;
    const cachedData = await getCache<{ data: CreditConsumption[]; timestamp: number }>(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // Fetch from API if no valid cache
    const response = await axios.get<CreditConsumption[]>(`/analytics/credit-consumption?range=${timeRange}`);
    
    // Cache the response
    await setCache(cacheKey, { 
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error: any) {
    // Track error
    analytics.trackError(`Error fetching credit consumption: ${error.message}`, false);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to fetch credit consumption data'
    );
  }
});

export const fetchQueryDistribution = createAsyncThunk<
  QueryDistribution[],
  TimeRange,
  { rejectValue: string }
>('dashboard/fetchQueryDistribution', async (timeRange, { rejectWithValue }) => {
  try {
    // Track analytics event
    analytics.trackEvent('fetch_query_distribution', 'dashboard', { timeRange });
    
    // Try to get from cache first
    const cacheKey = `${QUERY_DISTRIBUTION_KEY}_${timeRange}`;
    const cachedData = await getCache<{ data: QueryDistribution[]; timestamp: number }>(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // Fetch from API if no valid cache
    const response = await axios.get<QueryDistribution[]>(`/analytics/query-distribution?range=${timeRange}`);
    
    // Cache the response
    await setCache(cacheKey, { 
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error: any) {
    // Track error
    analytics.trackError(`Error fetching query distribution: ${error.message}`, false);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to fetch query distribution data'
    );
  }
});

export const fetchTopDocuments = createAsyncThunk<
  TopDocument[],
  TimeRange,
  { rejectValue: string }
>('dashboard/fetchTopDocuments', async (timeRange, { rejectWithValue }) => {
  try {
    // Track analytics event
    analytics.trackEvent('fetch_top_documents', 'dashboard', { timeRange });
    
    // Try to get from cache first
    const cacheKey = `${TOP_DOCUMENTS_KEY}_${timeRange}`;
    const cachedData = await getCache<{ data: TopDocument[]; timestamp: number }>(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // Fetch from API if no valid cache
    const response = await axios.get<TopDocument[]>(`/analytics/top-documents?range=${timeRange}`);
    
    // Cache the response
    await setCache(cacheKey, { 
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error: any) {
    // Track error
    analytics.trackError(`Error fetching top documents: ${error.message}`, false);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to fetch top documents data'
    );
  }
});

export const fetchActivityLog = createAsyncThunk<
  ActivityLogEntry[],
  TimeRange,
  { rejectValue: string }
>('dashboard/fetchActivityLog', async (timeRange, { rejectWithValue }) => {
  try {
    // Track analytics event
    analytics.trackEvent('fetch_activity_log', 'dashboard', { timeRange });
    
    // Try to get from cache first
    const cacheKey = `${ACTIVITY_LOG_KEY}_${timeRange}`;
    const cachedData = await getCache<{ data: ActivityLogEntry[]; timestamp: number }>(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // Fetch from API if no valid cache
    const response = await axios.get<ActivityLogEntry[]>(`/analytics/activity-log?range=${timeRange}`);
    
    // Cache the response
    await setCache(cacheKey, { 
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error: any) {
    // Track error
    analytics.trackError(`Error fetching activity log: ${error.message}`, false);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to fetch activity log data'
    );
  }
});

// Thunk for refreshing all dashboard data
export const refreshDashboard = createAsyncThunk<
  void,
  TimeRange,
  { rejectValue: string }
>('dashboard/refreshDashboard', async (timeRange, { dispatch, rejectWithValue }) => {
  try {
    // Track analytics event
    analytics.trackEvent('refresh_dashboard', 'dashboard', { timeRange });
    
    // Dispatch all fetch actions in parallel
    await Promise.all([
      dispatch(fetchUsageStats(timeRange)),
      dispatch(fetchCreditConsumption(timeRange)),
      dispatch(fetchQueryDistribution(timeRange)),
      dispatch(fetchTopDocuments(timeRange)),
      dispatch(fetchActivityLog(timeRange))
    ]);
  } catch (error: any) {
    // Track error
    analytics.trackError(`Error refreshing dashboard: ${error.message}`, false);
    
    return rejectWithValue(
      error.message || 'Failed to refresh dashboard'
    );
  }
});

// Initial state
const initialState: DashboardState = {
  timeRange: 'week', // Default to weekly view
  usageStats: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  },
  creditConsumption: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  queryDistribution: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  topDocuments: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  activityLog: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  isRefreshing: false
};

// Hydrate state from cache on client side
export const hydrateDashboardState = createAsyncThunk(
  'dashboard/hydrate',
  async () => {
    if (typeof window === 'undefined') return initialState;
    
    try {
      // Get time range from cache or use default
      const timeRange = await getCache<TimeRange>(TIME_RANGE_KEY) || 'week';
      
      // Get cached data for the time range
      const usageStatsCache = await getCache<{ data: UsageStats; timestamp: number }>(
        `${USAGE_STATS_KEY}_${timeRange}`
      );
      
      const creditConsumptionCache = await getCache<{ data: CreditConsumption[]; timestamp: number }>(
        `${CREDIT_CONSUMPTION_KEY}_${timeRange}`
      );
      
      const queryDistributionCache = await getCache<{ data: QueryDistribution[]; timestamp: number }>(
        `${QUERY_DISTRIBUTION_KEY}_${timeRange}`
      );
      
      const topDocumentsCache = await getCache<{ data: TopDocument[]; timestamp: number }>(
        `${TOP_DOCUMENTS_KEY}_${timeRange}`
      );
      
      const activityLogCache = await getCache<{ data: ActivityLogEntry[]; timestamp: number }>(
        `${ACTIVITY_LOG_KEY}_${timeRange}`
      );
      
      return {
        timeRange,
        usageStats: {
          data: usageStatsCache?.data || null,
          loading: false,
          error: null,
          lastFetched: usageStatsCache?.timestamp || null
        },
        creditConsumption: {
          data: creditConsumptionCache?.data || [],
          loading: false,
          error: null,
          lastFetched: creditConsumptionCache?.timestamp || null
        },
        queryDistribution: {
          data: queryDistributionCache?.data || [],
          loading: false,
          error: null,
          lastFetched: queryDistributionCache?.timestamp || null
        },
        topDocuments: {
          data: topDocumentsCache?.data || [],
          loading: false,
          error: null,
          lastFetched: topDocumentsCache?.timestamp || null
        },
        activityLog: {
          data: activityLogCache?.data || [],
          loading: false,
          error: null,
          lastFetched: activityLogCache?.timestamp || null
        },
        isRefreshing: false
      };
    } catch (error) {
      console.error('Error hydrating dashboard state:', error);
      return initialState;
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.timeRange = action.payload;
      
      // Store in cache
      if (typeof window !== 'undefined') {
        setCache(TIME_RANGE_KEY, action.payload);
      }
    },
    clearErrors: (state) => {
      state.usageStats.error = null;
      state.creditConsumption.error = null;
      state.queryDistribution.error = null;
      state.topDocuments.error = null;
      state.activityLog.error = null;
    }
  },
  extraReducers: (builder) => {
    // Hydrate state
    builder.addCase(hydrateDashboardState.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    
    // Refresh dashboard
    builder.addCase(refreshDashboard.pending, (state) => {
      state.isRefreshing = true;
    });
    builder.addCase(refreshDashboard.fulfilled, (state) => {
      state.isRefreshing = false;
    });
    builder.addCase(refreshDashboard.rejected, (state) => {
      state.isRefreshing = false;
    });
    
    // Usage stats
    builder.addCase(fetchUsageStats.pending, (state) => {
      state.usageStats.loading = true;
      state.usageStats.error = null;
    });
    builder.addCase(fetchUsageStats.fulfilled, (state, action) => {
      state.usageStats.loading = false;
      state.usageStats.data = action.payload;
      state.usageStats.lastFetched = Date.now();
    });
    builder.addCase(fetchUsageStats.rejected, (state, action) => {
      state.usageStats.loading = false;
      state.usageStats.error = action.payload || 'Failed to fetch usage statistics';
    });
    
    // Credit consumption
    builder.addCase(fetchCreditConsumption.pending, (state) => {
      state.creditConsumption.loading = true;
      state.creditConsumption.error = null;
    });
    builder.addCase(fetchCreditConsumption.fulfilled, (state, action) => {
      state.creditConsumption.loading = false;
      state.creditConsumption.data = action.payload;
      state.creditConsumption.lastFetched = Date.now();
    });
    builder.addCase(fetchCreditConsumption.rejected, (state, action) => {
      state.creditConsumption.loading = false;
      state.creditConsumption.error = action.payload || 'Failed to fetch credit consumption data';
    });
    
    // Query distribution
    builder.addCase(fetchQueryDistribution.pending, (state) => {
      state.queryDistribution.loading = true;
      state.queryDistribution.error = null;
    });
    builder.addCase(fetchQueryDistribution.fulfilled, (state, action) => {
      state.queryDistribution.loading = false;
      state.queryDistribution.data = action.payload;
      state.queryDistribution.lastFetched = Date.now();
    });
    builder.addCase(fetchQueryDistribution.rejected, (state, action) => {
      state.queryDistribution.loading = false;
      state.queryDistribution.error = action.payload || 'Failed to fetch query distribution data';
    });
    
    // Top documents
    builder.addCase(fetchTopDocuments.pending, (state) => {
      state.topDocuments.loading = true;
      state.topDocuments.error = null;
    });
    builder.addCase(fetchTopDocuments.fulfilled, (state, action) => {
      state.topDocuments.loading = false;
      state.topDocuments.data = action.payload;
      state.topDocuments.lastFetched = Date.now();
    });
    builder.addCase(fetchTopDocuments.rejected, (state, action) => {
      state.topDocuments.loading = false;
      state.topDocuments.error = action.payload || 'Failed to fetch top documents data';
    });
    
    // Activity log
    builder.addCase(fetchActivityLog.pending, (state) => {
      state.activityLog.loading = true;
      state.activityLog.error = null;
    });
    builder.addCase(fetchActivityLog.fulfilled, (state, action) => {
      state.activityLog.loading = false;
      state.activityLog.data = action.payload;
      state.activityLog.lastFetched = Date.now();
    });
    builder.addCase(fetchActivityLog.rejected, (state, action) => {
      state.activityLog.loading = false;
      state.activityLog.error = action.payload || 'Failed to fetch activity log data';
    });
  }
});

export const { setTimeRange, clearErrors } = dashboardSlice.actions;

export default dashboardSlice.reducer;
