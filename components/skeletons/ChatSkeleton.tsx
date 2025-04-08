import React from 'react';
import { Skeleton } from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ChatSkeletonProps {
  messageCount?: number;
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}

/**
 * Skeleton loader for chat interface with responsive design
 */
const ChatSkeleton: React.FC<ChatSkeletonProps> = ({
  messageCount = 4,
  showHeader = true,
  showSidebar = true,
  className,
}) => {
  return (
    <div className={cn('flex h-full w-full', className)}>
      {/* Sidebar skeleton - hidden on mobile, shown on larger screens */}
      {showSidebar && (
        <div className="hidden md:flex md:w-64 lg:w-80 flex-col border-r border-gray-200 dark:border-gray-800 animate-pulse">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
          
          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="p-3">
                <Skeleton className="h-5 w-4/5 mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </Card>
            ))}
          </div>
          
          {/* Sidebar footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      )}
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat header */}
        {showHeader && (
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-3 h-16 animate-pulse">
            {/* Mobile menu button - only on small screens */}
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-md md:hidden mr-3" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        )}
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
          {Array.from({ length: messageCount }).map((_, index) => (
            <div 
              key={index} 
              className={cn(
                "flex",
                index % 2 === 0 ? "justify-start" : "justify-end"
              )}
            >
              <div 
                className={cn(
                  "flex max-w-[85%] sm:max-w-[75%] md:max-w-[65%] gap-2",
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                )}
              >
                {/* Avatar - only show for AI messages */}
                {index % 2 === 0 && (
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 mt-2" />
                )}
                
                {/* Message bubble */}
                <div 
                  className={cn(
                    "rounded-xl p-3",
                    index % 2 === 0 
                      ? "bg-gray-200 dark:bg-gray-800 rounded-tl-none" 
                      : "bg-primary-100 dark:bg-primary-900 rounded-tr-none"
                  )}
                >
                  {/* Message content with varying lengths */}
                  <div className="space-y-2">
                    <Skeleton className={`h-4 w-${Math.floor(Math.random() * 20) + 20}`} />
                    <Skeleton className={`h-4 w-${Math.floor(Math.random() * 40) + 40}`} />
                    {(index % 3 === 0) && (
                      <>
                        <Skeleton className={`h-4 w-${Math.floor(Math.random() * 30) + 10}`} />
                        <Skeleton className={`h-4 w-${Math.floor(Math.random() * 20) + 15}`} />
                      </>
                    )}
                  </div>
                  
                  {/* Source attribution for AI messages */}
                  {index % 2 === 0 && Math.random() > 0.5 && (
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3 mt-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input area */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 animate-pulse">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-grow rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          </div>
          
          {/* Context files section - conditionally shown */}
          {Math.random() > 0.5 && (
            <div className="flex items-center mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-4 w-32 mr-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
