'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentConversation, selectConversations } from '@/redux/slices/chatSlice';
import { ChatAnalytics as ChatAnalyticsType } from '@/types/chat';

// This component doesn't render anything visually
// It just tracks analytics events from chat interactions
const ChatAnalytics: React.FC = () => {
  const currentConversation = useAppSelector(selectCurrentConversation);
  const conversations = useAppSelector(selectConversations);
  
  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page view event
      const analyticsData = {
        event: 'page_view',
        page_type: currentConversation ? 'conversation' : 'chat_list',
        conversation_id: currentConversation?.id,
      };
      
      // If you have a generic analytics function, call it here
      window.dispatchEvent(new CustomEvent('track_analytics', { 
        detail: analyticsData 
      }));
    }
  }, [currentConversation?.id]);
  
  // Calculate and track chat metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      // Calculate analytics metrics
      const totalMessages = conversations.reduce(
        (count, conv) => count + (conv.messages?.length || 0), 
        0
      );
      
      const avgMessagesPerConversation = totalMessages / conversations.length;
      
      // Find all files used in conversations
      const contextFiles: { [key: string]: { id: string, name: string, count: number } } = {};
      
      conversations.forEach(conv => {
        if (conv.fileContext && conv.fileContext.length > 0) {
          conv.fileContext.forEach(fileId => {
            if (!contextFiles[fileId]) {
              contextFiles[fileId] = { 
                id: fileId, 
                name: fileId, // Ideally we'd have the name, but this is a placeholder
                count: 0 
              };
            }
            contextFiles[fileId].count += 1;
          });
        }
      });
      
      // Get top files sorted by usage count
      const topFiles = Object.values(contextFiles)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(file => ({
          fileId: file.id,
          fileName: file.name,
          useCount: file.count
        }));
      
      const chatAnalytics: ChatAnalyticsType = {
        conversationCount: conversations.length,
        messageCount: totalMessages,
        averageMessagesPerConversation: avgMessagesPerConversation,
        averageResponseTime: 0, // Would need timestamp data to calculate this
        topContextFiles: topFiles
      };
      
      // Track analytics event
      window.dispatchEvent(new CustomEvent('track_chat_analytics', { 
        detail: chatAnalytics 
      }));
    }
  }, [conversations]);
  
  // This component doesn't render anything visually
  return null;
};

export default ChatAnalytics;
