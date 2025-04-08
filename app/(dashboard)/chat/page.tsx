'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { clearCurrentConversation } from '@/redux/slices/chatSlice';
import ChatList from '@/components/chat/ChatList';
import CreateConversationModal from '@/components/chat/CreateConversationModal';
import ChatAnalytics from '@/components/chat/ChatAnalytics';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function ChatListPage() {
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Clear any current conversation when this page loads
  useEffect(() => {
    dispatch(clearCurrentConversation());
  }, [dispatch]);

  const handleCreateConversation = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Chat</h1>
            <button
              onClick={handleCreateConversation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              New Conversation
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <ChatList onCreateConversation={handleCreateConversation} />
          </div>
        </div>

        <CreateConversationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        
        {/* Analytics tracking (invisible component) */}
        <ChatAnalytics />
      </div>
    </DashboardLayout>
  );
}
