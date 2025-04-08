'use client';

import { Skeleton } from '@/components/ui/Loader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Skeleton loader for the dashboard
 * Mimics the layout structure of the actual dashboard with loading animation
 * Responsive for different screen sizes
 */
export default function DashboardSkeleton() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  return (
    <div className="animate-pulse">
      {/* Header with title and time period selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <Skeleton className="h-8 w-40 mb-4 sm:mb-0" />
        <Skeleton className="h-9 w-full sm:w-36" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="flex flex-col h-full">
            <div className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-7 w-2/3 mt-2" />
                <Skeleton className="h-5 w-1/3 mt-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row - different grid layouts for responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Credit consumption chart */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="flex items-center justify-center">
              <Skeleton className="w-full h-[300px]" />
            </div>
          </CardContent>
        </Card>

        {/* Query distribution chart */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="flex items-center justify-center">
              <Skeleton className="w-full h-[300px]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row - top documents and activity log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top documents */}
        <Card className="lg:col-span-2 h-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
                <Skeleton className="h-9 w-9 mr-3 rounded-md" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-4/5 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity timeline */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
