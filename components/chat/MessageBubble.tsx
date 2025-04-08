'use client';

import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { formatRelative } from 'date-fns';
import { UserIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import SourceAttribution from './SourceAttribution';

interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  isLastMessage?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showTimestamp = true, isLastMessage = false }) => {
  const [showSources, setShowSources] = useState(true);
  const isUser = message.role === 'user';
  
  // Determine status styling
  let statusIcon = null;
  let statusText = '';
  
  if (message.status === 'sending') {
    statusText = 'Sending...';
  } else if (message.status === 'error') {
    statusIcon = <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
    statusText = 'Failed to send';
  } else if (message.status === 'queued') {
    statusText = 'Waiting to send (offline)';
  }

  // Format message content with line breaks
  const formattedContent = message.content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < message.content.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      id={`message-${message.id}`}
    >
      <div
        className={`
          relative max-w-[85%] sm:max-w-[75%] rounded-lg p-3 sm:p-4
          ${isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}
          ${isLastMessage && 'animate-fadeIn'}
        `}
      >
        <div className="flex items-start">
          {!isUser && (
            <div className="mr-3 flex-shrink-0">
              <div className="p-1 rounded-full bg-blue-600 text-white">
                <SparklesIcon className="h-4 w-4" />
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <div className={`text-sm sm:text-base whitespace-pre-wrap break-words ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {formattedContent}
            </div>
            
            {/* Sources section, only for assistant messages */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-3">
                <div 
                  className="flex items-center cursor-pointer text-sm text-blue-600 dark:text-blue-400"
                  onClick={() => setShowSources(!showSources)}
                >
                  <span className="font-medium">
                    {showSources ? 'Hide sources' : 'Show sources'}
                  </span>
                  <svg 
                    className={`ml-1 h-4 w-4 transition-transform ${showSources ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showSources && (
                  <div className="mt-2 space-y-2 text-xs sm:text-sm">
                    <SourceAttribution sources={message.sources} />
                  </div>
                )}
              </div>
            )}
            
            {/* Message timestamp and status */}
            {(showTimestamp || statusText) && (
              <div className={`mt-2 flex items-center justify-end text-xs ${
                isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {statusIcon && <span className="mr-1">{statusIcon}</span>}
                {statusText && <span className="mr-2">{statusText}</span>}
                
                {showTimestamp && message.timestamp && (
                  <time dateTime={message.timestamp}>
                    {formatRelative(new Date(message.timestamp), new Date())}
                  </time>
                )}
              </div>
            )}
          </div>
          
          {isUser && (
            <div className="ml-3 flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
