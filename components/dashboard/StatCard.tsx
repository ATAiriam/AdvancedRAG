'use client';

import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useAppSelector } from '@/redux/store';
import StatCard from './StatCard';
import { formatFileSize } from '@/lib/utils';

/**
 * Stats cards component displaying usage metrics
 * Grid layout that stacks cards on mobile
 */
export default function StatsCards() {
  const { data, loading, error } = useAppSelector(state => state.dashboard.usageStats);
  
  // Format values for display
  const formatValue = (value: number | null, type: 'number' | 'time' | 'tokens') => {
    if (value === null) return '-';
    
    switch (type) {
      case 'number':
        return value.toLocaleString();
      case 'time':
        return `${value.toFixed(2)}s`;
      case 'tokens':
        // Use K/M/B suffix for large numbers
        if (value >= 1_000_000_000) {
          return `${(value / 1_000_000_000).toFixed(1)}B`;
        }
        if (value >= 1_000_000) {
          return `${(value / 1_000_000).toFixed(1)}M`;
        }
        if (value >= 1_000) {
          return `${(value / 1_000).toFixed(1)}K`;
        }
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Queries */}
      <StatCard
        title="Total Queries"
        value={data ? formatValue(data.totalQueries, 'number') : null}
        icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
        iconColor="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        isLoading={loading}
        error={error}
      />
      
      {/* Total Files */}
      <StatCard
        title="Total Files"
        value={data ? formatValue(data.totalFiles, 'number') : null}
        icon={<DocumentTextIcon className="h-5 w-5" />}
        iconColor="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
        isLoading={loading}
        error={error}
      />
      
      {/* Tokens Consumed */}
      <StatCard
        title="Tokens Consumed"
        value={data ? formatValue(data.totalTokensConsumed, 'tokens') : null}
        icon={<CurrencyDollarIcon className="h-5 w-5" />}
        iconColor="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400"
        isLoading={loading}
        error={error}
      />
      
      {/* Average Response Time */}
      <StatCard
        title="Avg Response Time"
        value={data ? formatValue(data.averageResponseTime, 'time') : null}
        icon={<ClockIcon className="h-5 w-5" />}
        iconColor="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
        isLoading={loading}
        error={error}
      />
    </div>
  );
}
