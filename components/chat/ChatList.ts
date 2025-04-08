'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchConversations, deleteConversation, selectConversations, selectIsLoading } from '@/redux/slices/chatSlice';
import { Conversation } from '@/types/chat';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Dropdown from '@/components/ui/Dropdown';
import Toast from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubbleLeftRightIcon, DocumentTextIcon, TrashIcon, EllipsisVerticalIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import ChatSkeleton from '@/components/skeletons/ChatSkeleton';

interface ChatListProps {
  onCreateConversation: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onCreateConversation }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectConversations);
  const isLoading = useAppSelector(selectIsLoading);
  const [showDeleteToast, setShowDeleteToast] = React.useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleDelete = async (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${conversation.title}"?`)) {
      await dispatch(deleteConversation(conversation.id));
      setShowDeleteToast(true);
    }
  };

  const handleCardClick = (conversation: Conversation) => {
    router.push(`/chat/${conversation.id}`);
  };

  if (isLoading) {
    return <ChatSkeleton type="list" count={4} />;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <EmptyState
          icon={<ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400" />}
          title="No conversations yet"
          description="Start a new conversation to chat with your AI assistant"
          action={
            <Button onClick={onCreateConversation} className="mt-4">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              New Conversation
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden"
            onClick={() => handleCardClick(conversation)}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={conversation.title}>
                  {conversation.title}
                </h3>
                <Dropdown
                  trigger={
                    <button 
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Conversation options"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  }
                  align="right"
                  items={[
                    {
                      label: 'Delete conversation',
                      icon: <TrashIcon className="h-5 w-5" />,
                      onClick: (e) => handleDelete(e, conversation),
                      className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }
                  ]}
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 flex-grow">
                {conversation.messages.length > 0 
                  ? conversation.messages[conversation.messages.length - 1].content 
                  : 'No messages yet'}
              </p>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    {conversation.messages.length} {conversation.messages.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>
                
                {conversation.fileContext && conversation.fileContext.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    {conversation.fileContext.length} {conversation.fileContext.length === 1 ? 'file' : 'files'}
                  </div>
                )}
                
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                </time>
              </div>
            </div>
          </Card>
        ))}
      </div>

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

export default ChatList;
