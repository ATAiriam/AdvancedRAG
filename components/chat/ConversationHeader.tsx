'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { deleteConversation, selectCurrentConversation } from '@/redux/slices/chatSlice';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Toast from '@/components/ui/Toast';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  EllipsisVerticalIcon, 
  PlusIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

interface ConversationHeaderProps {
  onChangeFiles: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ onChangeFiles }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectCurrentConversation);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const handleBack = () => {
    router.push('/chat');
  };

  const handleDelete = async () => {
    if (!conversation) return;
    
    if (window.confirm(`Are you sure you want to delete "${conversation.title}"?`)) {
      await dispatch(deleteConversation(conversation.id));
      setShowDeleteToast(true);
      setTimeout(() => {
        router.push('/chat');
      }, 500);
    }
  };

  if (!conversation) return null;

  const fileCount = conversation.fileContext?.length || 0;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate mr-2" title={conversation.title}>
                {conversation.title}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {fileCount > 0 && (
                <div className="hidden sm:flex items-center text-xs text-gray-600 dark:text-gray-300 mr-2">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {fileCount} {fileCount === 1 ? 'file' : 'files'} in context
                </div>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onChangeFiles}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                {fileCount > 0 ? 'Change Files' : 'Add Files'}
              </Button>
              
              <Dropdown
                trigger={
                  <button 
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                    aria-label="Conversation options"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                }
                align="right"
                items={[
                  {
                    label: 'Delete conversation',
                    icon: <TrashIcon className="h-5 w-5" />,
                    onClick: handleDelete,
                    className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }
                ]}
              />
            </div>
          </div>
          
          {/* Context files banner (only on mobile) */}
          {fileCount > 0 && (
            <div className="sm:hidden mt-3 mb-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-xs text-blue-700 dark:text-blue-300 flex items-start">
              <DocumentTextIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Context files:</span>{' '}
                <span className="line-clamp-1">
                  {conversation.fileContext && conversation.fileContext.length > 0 
                    ? conversation.fileContext.join(', ') 
                    : 'No files selected'}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {showDeleteToast && (
        <Toast
          message="Conversation deleted"
          type="success"
          onClose={() => setShowDeleteToast(false)}
          autoClose={3000}
        />
      )}
    </>
  );
};

export default ConversationHeader;
