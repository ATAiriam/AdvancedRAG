import React from 'react';
import { Skeleton } from '@/components/ui/Loader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface AnalyticsSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader for analytics dashboard with responsive design
 */
const AnalyticsSkeleton: React.FC<AnalyticsSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Period selector */}
      <div className="flex justify-between items-center animate-pulse">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-2/3 mb-2" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-16 mr-2" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main charts section - responsive grid for different screen sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {/* Credit consumption chart */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
              <div className="w-full">
                {/* Chart header */}
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
                
                {/* Chart bar placeholders */}
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-end h-6 w-full">
                      <Skeleton 
                        className={`h-${Math.floor(Math.random() * 6) + 1} w-full rounded-sm`} 
                      />
                    </div>
                  ))}
                </div>
                
                {/* Chart labels */}
                <div className="flex justify-between mt-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-4 w-12" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Query distribution chart */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
              {/* Pie chart placeholder */}
              <div className="relative w-[200px] h-[200px]">
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute top-0 w-full h-1/3 bg-gray-200 dark:bg-gray-800"></div>
                  <div className="absolute top-1/3 left-0 w-1/2 h-1/3 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="absolute top-1/3 left-1/2 w-1/2 h-1/3 bg-gray-400 dark:bg-gray-600"></div>
                  <div className="absolute top-2/3 w-full h-1/3 bg-gray-500 dark:bg-gray-500"></div>
                </div>
                
                {/* Center circle */}
                <div className="absolute inset-[25%] rounded-full bg-white dark:bg-gray-900"></div>
              </div>
              
              {/* Legend */}
              <div className="ml-4 space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-sm mr-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity log and top documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        {/* Activity log */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start">
                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-4/5 mb-1" />
                      <Skeleton className="h-3 w-2/3 mb-2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Top documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="p-3 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                    <th className="p-3 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="p-3 text-left hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="p-3 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="p-3">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-md mr-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-3 text-right">
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;