'use client';

import { 
  DocumentPlusIcon, 
  TrashIcon, 
  ChatBubbleLeftRightIcon, 
  ChatBubbleOvalLeftIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loader';
import { useAppSelector } from '@/redux/store';
import { ActivityLogEntry } from '@/redux/slices/dashboardSlice';
import { getRelativeTimeString } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Activity Timeline component for dashboard
 * Shows recent user activities with responsive design for mobile
 */
export default function ActivityTimeline() {
  const { data, loading, error } = useAppSelector(state => state.dashboard.activityLog);
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Get icon based on activity type
  const getActivityIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'file_upload':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        );
      case 'logout':
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <div className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  // Get activity text based on type
  const getActivityText = (activity: ActivityLogEntry) => {
    switch (activity.type) {
      case 'file_upload':
        return `uploaded a file`;
      case 'file_delete':
        return `deleted a file`;
      case 'conversation_create':
        return `started a new conversation`;
      case 'conversation_message':
        return `sent a message`;
      case 'login':
        return `logged in`;
      case 'logout':
        return `logged out`;
      default:
        return `performed an action`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-0 sm:pb-2">
        <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 sm:p-6 h-full overflow-hidden">
        {loading ? (
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex mb-6 last:mb-0">
                <Skeleton className="h-8 w-8 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-red-500 dark:text-red-400 font-medium mb-2">Error loading activity</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No recent activity</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your recent activities will appear here as you use the system.
            </p>
          </div>
        ) : (
          <div className="relative overflow-y-auto max-h-80 p-4">
            <div className="pb-2">
              {data.map((activity, index) => (
                <div key={activity.id} className="relative pb-8">
                  {/* Connector line, except for last item */}
                  {index < data.length - 1 && (
                    <span 
                      className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" 
                      aria-hidden="true"
                    />
                  )}
                  
                  <div className="relative flex items-start space-x-3">
                    {/* Activity icon */}
                    <div className="relative">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Activity content */}
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activity.username}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {getActivityText(activity)}
                          {activity.description && ` - ${activity.description}`}
                        </p>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getRelativeTimeString(new Date(activity.timestamp))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <DocumentPlusIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        );
      case 'file_delete':
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        );
      case 'conversation_create':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        );
      case 'conversation_message':
        return (
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <ChatBubbleOvalLeftIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        );
      case 'login':
        return (