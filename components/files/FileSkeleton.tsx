import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface FileSkeletonProps {
  viewMode: 'grid' | 'list';
}

export const FileSkeleton: React.FC<FileSkeletonProps> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="w-full p-4 border-b flex items-center gap-4">
        <Skeleton className="h-4 w-4 rounded-sm" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  return (
    <Card>
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-4 rounded-sm" />
        </div>
      </div>
      
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-1 mt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 justify-end gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardFooter>
    </Card>
  );
};
