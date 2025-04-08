'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  sendMessage, 
  addMessageToQueue, 
  addMessageOptimistic,
  selectIsSendingMessage, 
  selectCurrentConversation 
} from '@/redux/slices/chatSlice';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types/chat';
import useOfflineStatus from '@/hooks/useOfflineStatus';

interface ChatInputProps {
  onMessageSent?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onMessageSent }) => {
  const dispatch = useAppDispatch();
  const isSending = useAppSelector(selectIsSendingMessage);
  const currentConversation = useAppSelector(selectCurrentConversation);
  const isOffline = useOfflineStatus();
  
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle textarea auto-resizing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Reset textarea height when conversation changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [currentConversation?.id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || !currentConversation || isSending) return;
    
    const trimmedMessage = message.trim();
    setMessage('');
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: uuidv4(),
      conversationId: currentConversation.id,
      content: trimmedMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
      status: isOffline ? 'queued' : 'sending'
    };
    
    // Update UI immediately
    dispatch(addMessageOptimistic({
      conversationId: currentConversation.id,
      message: optimisticMessage
    }));
    
    // If offline, add to queue
    if (isOffline) {
      dispatch(addMessageToQueue({
        conversationId: currentConversation.id,
        message: { content: trimmedMessage }
      }));
      onMessageSent?.();
      return;
    }
    
    // Send the message
    try {
      await dispatch(sendMessage({
        conversationId: currentConversation.id,
        content: trimmedMessage
      }));
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but not with Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none text-gray-900 dark:text-white text-sm sm:text-base py-2 px-2 max-h-[200px] min-h-[48px] overflow-auto"
            style={{ height: 'auto' }}
            rows={1}
            disabled={isSending || !currentConversation}
            aria-label="Message input"
          />
          <div className="flex-shrink-0 ml-2">
            <Button
              type="submit"
              disabled={!message.trim() || isSending || !currentConversation}
              aria-label="Send message"
              className="rounded-full w-10 h-10 flex items-center justify-center"
            >
              {isSending ? <Loader size="small" /> : <PaperAirplaneIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {isOffline && (
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1 text-center">
            You're offline. Messages will be sent when you reconnect.
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
