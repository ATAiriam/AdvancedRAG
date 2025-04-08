import React from 'react';

interface ChatSkeletonProps {
  type: 'list' | 'message' | 'conversation';
  count?: number;
}

const ChatSkeleton: React.FC<ChatSkeletonProps> = ({ type, count = 3 }) => {
  const renderChatListSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMessageSkeleton = () => (
    <div className="px-4 py-2 space-y-4">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div 
            className={`
              rounded-lg p-3 animate-pulse
              ${index % 2 === 0 
                ? 'bg-gray-100 dark:bg-gray-800 max-w-[75%]' 
                : 'bg-gray-200 dark:bg-gray-700 max-w-[65%]'
              }
            `}
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
            
            <div className="mt-2 flex justify-end">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderConversationSkeleton = () => (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {renderMessageSkeleton()}
      </div>
      
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex items-center">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-10 w-10 ml-2 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'list':
      return renderChatListSkeleton();
    case 'message':
      return renderMessageSkeleton();
    case 'conversation':
      return renderConversationSkeleton();
    default:
      return null;
  }
};

export default ChatSkeleton;
