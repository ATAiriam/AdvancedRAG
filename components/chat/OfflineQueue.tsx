'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  sendMessage, 
  removeMessageFromQueue, 
  selectOfflineQueue 
} from '@/redux/slices/chatSlice';
import useOfflineStatus from '@/hooks/useOfflineStatus';
import Toast from '@/components/ui/Toast';

const OfflineQueue: React.FC = () => {
  const dispatch = useAppDispatch();
  const offlineQueue = useAppSelector(selectOfflineQueue);
  const isOffline = useOfflineStatus();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  // Process queue when coming back online
  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0) {
      setToastMessage(`Sending ${offlineQueue.length} queued message${offlineQueue.length > 1 ? 's' : ''}...`);
      setShowToast(true);
      
      // Process messages in queue
      const processQueue = async () => {
        // Process one message at a time to maintain order
        for (let i = 0; i < offlineQueue.length; i++) {
          const { conversationId, message } = offlineQueue[i];
          
          try {
            await dispatch(sendMessage({
              conversationId,
              content: message.content
            }));
            dispatch(removeMessageFromQueue(0)); // Always remove first item
          } catch (error) {
            console.error('Failed to send queued message:', error);
            // Continue with next message even if one fails
          }
        }
        
        setToastMessage('All queued messages sent');
        setShowToast(true);
        
        // Auto-close toast after 3 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      };
      
      processQueue();
    }
  }, [isOffline, offlineQueue, dispatch]);

  // Don't render anything in the UI except for toast notifications
  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setShowToast(false)}
          autoClose={3000}
        />
      )}
    </>
  );
};

export default OfflineQueue;
