'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchConversation, 
  selectCurrentConversation, 
  selectIsLoading 
} from '@/redux/slices/chatSlice';
import ConversationHeader from '@/components/chat/ConversationHeader';
import FileContextSelector from '@/components/chat/FileContextSelector';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import OfflineQueue from '@/components/chat/OfflineQueue';
import ChatAnalytics from '@/components/chat/ChatAnalytics';
import ChatSkeleton from '@/components/skeletons/ChatSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectCurrentConversation);
  const isLoading = useAppSelector(selectIsLoading);
  
  const [isFileContextOpen, setIsFileContextOpen] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch conversation data when component mounts
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchConversation(conversationId));
    }
  }, [conversationId, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current && conversation?.messages) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation?.messages]);

  // Handle the "Add/Change Files" button click
  const handleChangeFiles = () => {
    setIsFileContextOpen(true);
  };

  // Scroll to bottom after sending a message
  const handleMessageSent = () => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <ChatSkeleton type="conversation" />
      </DashboardLayout>
    );
  }

  // Render not found state
  if (!conversation && !isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <EmptyState
            icon={<ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400" />}
            title="Conversation not found"
            description="This conversation may have been deleted or doesn't exist."
            action={
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout className="p-0 flex flex-col h-full overflow-hidden">
      {/* Offline message queue manager (invisible) */}
      <OfflineQueue />
      
      {/* Analytics tracking (invisible) */}
      <ChatAnalytics />
      
      {/* Conversation header */}
      <ConversationHeader onChangeFiles={handleChangeFiles} />
      
      {/* Message thread */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4"
      >
        <div className="max-w-4xl mx-auto">
          {/* File context banner (only visible on larger screens) */}
          {conversation?.fileContext && conversation.fileContext.length > 0 && (
            <div className="hidden sm:block mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="font-semibold">Context files:</span>{' '}
                  <span>
                    {conversation.fileContext.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Messages */}
          {conversation?.messages && conversation.messages.length > 0 ? (
            <div className="space-y-4 pb-4">
              {conversation.messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLastMessage={index === conversation.messages.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Start the conversation by sending a message. Ask questions about your documents or any topic.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Message input */}
      <ChatInput onMessageSent={handleMessageSent} />
      
      {/* File context selector modal */}
      <FileContextSelector
        isOpen={isFileContextOpen}
        onClose={() => setIsFileContextOpen(false)}
      />
    </DashboardLayout>
  );
}
