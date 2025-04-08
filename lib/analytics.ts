import { getCache, setCache } from './cache';

// Analytics event types
export type EventType = 
  | 'pageView'
  | 'fileUpload'
  | 'fileDownload'
  | 'chatMessage'
  | 'search'
  | 'login'
  | 'logout'
  | 'register'
  | 'error'
  | 'userAction'
  | 'performance';

// Analytics event data
export interface AnalyticsEvent {
  type: EventType;
  name: string;
  data?: Record<string, any>;
  timestamp?: number;
}

// User session data
export interface UserSession {
  id: string;
  startTime: number;
  lastActive: number;
  referrer?: string;
  entryPage?: string;
  userAgent?: string;
  screenSize?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  tenant?: string;
}

// Queue for offline analytics
const ANALYTICS_QUEUE_KEY = 'analytics_event_queue';
const SESSION_KEY = 'analytics_user_session';
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
const ANALYTICS_PROVIDER = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'google-analytics';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Interval to send batched events (5 seconds)
const BATCH_INTERVAL = 5000;

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Flag to track if we're already sending a batch
let isSendingBatch = false;

// Setup Google Analytics
function initializeGoogleAnalytics() {
  if (typeof window !== 'undefined' && ANALYTICS_ENABLED && GA_MEASUREMENT_ID) {
    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // Initialize GA with config
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { 
      send_page_view: false, // We'll manually track page views
      transport_type: 'beacon',
    });
    
    return true;
  }
  return false;
}

// Get or create a new user session
async function getOrCreateSession(): Promise<UserSession> {
  // Try to get existing session
  const existingSession = await getCache<UserSession>(SESSION_KEY);
  
  if (existingSession) {
    // Check if session has timed out
    if (Date.now() - existingSession.lastActive <= SESSION_TIMEOUT) {
      // Update last active time
      const updatedSession = {
        ...existingSession,
        lastActive: Date.now()
      };
      await setCache(SESSION_KEY, updatedSession);
      return updatedSession;
    }
  }
  
  // Create new session
  const newSession: UserSession = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    startTime: Date.now(),
    lastActive: Date.now(),
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    entryPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
    deviceType: getDeviceType(),
  };
  
  await setCache(SESSION_KEY, newSession);
  return newSession;
}

// Determine device type based on screen size and user agent
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop';
  }
  
  const ua = navigator.userAgent;
  
  // Check if mobile based on user agent
  if (/(android|iphone|ipod|mobile)/i.test(ua)) {
    return 'mobile';
  }
  
  // Check if tablet based on user agent
  if (/(ipad|tablet)/i.test(ua)) {
    return 'tablet';
  }
  
  // Check based on screen size as fallback
  const width = window.innerWidth;
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  }
  
  return 'desktop';
}

// Add event to queue
async function addToQueue(event: AnalyticsEvent): Promise<void> {
  // Get current queue
  const queue = await getCache<AnalyticsEvent[]>(ANALYTICS_QUEUE_KEY) || [];
  
  // Add event to queue
  queue.push({
    ...event,
    timestamp: Date.now()
  });
  
  // Save updated queue
  await setCache(ANALYTICS_QUEUE_KEY, queue);
  
  // Try to send queue if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    trySendBatch();
  }
}

// Try to send batch of events
async function trySendBatch(): Promise<void> {
  // Prevent multiple sends
  if (isSendingBatch) {
    return;
  }
  
  isSendingBatch = true;
  
  try {
    // Get current queue
    const queue = await getCache<AnalyticsEvent[]>(ANALYTICS_QUEUE_KEY) || [];
    
    // If queue is empty, do nothing
    if (queue.length === 0) {
      isSendingBatch = false;
      return;
    }
    
    // Send events based on provider
    if (ANALYTICS_PROVIDER === 'google-analytics' && typeof window !== 'undefined' && window.gtag) {
      for (const event of queue) {
        if (event.type === 'pageView') {
          window.gtag('event', 'page_view', {
            page_title: event.data?.title,
            page_location: event.data?.url,
            page_path: event.data?.path,
          });
        } else {
          window.gtag('event', event.name, event.data);
        }
      }
    } else {
      // Custom analytics implementation
      try {
        // Get current session
        const session = await getOrCreateSession();
        
        // Send events to backend
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: queue,
            session,
          }),
          keepalive: true, // Keep request alive even if page is navigating away
        });
      } catch (error) {
        console.error('Failed to send analytics events:', error);
        // Keep events in queue
        isSendingBatch = false;
        return;
      }
    }
    
    // Clear queue
    await setCache(ANALYTICS_QUEUE_KEY, []);
  } finally {
    // Reset flag
    isSendingBatch = false;
  }
}

// Schedule periodic sending of batched events
function scheduleBatchSending(): void {
  if (typeof window !== 'undefined') {
    // Send batch periodically
    setInterval(() => {
      if (navigator.onLine) {
        trySendBatch();
      }
    }, BATCH_INTERVAL);
    
    // Send batch when user is about to leave the page
    window.addEventListener('beforeunload', () => {
      trySendBatch();
    });
    
    // Send batch when user comes back online
    window.addEventListener('online', () => {
      trySendBatch();
    });
  }
}

// Initialize analytics
export function initializeAnalytics(): void {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  // Initialize based on provider
  if (ANALYTICS_PROVIDER === 'google-analytics') {
    initializeGoogleAnalytics();
  }
  
  // Get or create session
  getOrCreateSession();
  
  // Schedule batch sending
  scheduleBatchSending();
}

// Track page view
export async function trackPageView(
  path: string,
  title?: string,
  referrer?: string
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  await addToQueue({
    type: 'pageView',
    name: 'page_view',
    data: {
      path,
      title: title || document.title,
      url: window.location.href,
      referrer: referrer || document.referrer,
    },
  });
  
  // Update session last active time
  const session = await getCache<UserSession>(SESSION_KEY);
  if (session) {
    await setCache(SESSION_KEY, {
      ...session,
      lastActive: Date.now(),
    });
  }
}

// Track event
export async function trackEvent(
  name: string,
  category: string,
  data?: Record<string, any>
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  await addToQueue({
    type: 'userAction',
    name,
    data: {
      event_category: category,
      ...data,
    },
  });
}

// Track error
export async function trackError(
  error: Error | string,
  fatal: boolean = false,
  data?: Record<string, any>
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error !== 'string' && error.stack ? error.stack : undefined;
  
  await addToQueue({
    type: 'error',
    name: 'exception',
    data: {
      description: errorMessage,
      fatal,
      stack: errorStack,
      ...data,
    },
  });
}

// Track file upload
export async function trackFileUpload(
  fileType: string,
  fileSize: number,
  fileName?: string,
  source?: string
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  await addToQueue({
    type: 'fileUpload',
    name: 'file_upload',
    data: {
      file_type: fileType,
      file_size: fileSize,
      file_name: fileName,
      upload_source: source,
    },
  });
}

// Track chat message
export async function trackChatMessage(
  messageType: 'user' | 'assistant',
  conversationId: string,
  messageLength: number,
  withFileContext: boolean = false
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  await addToQueue({
    type: 'chatMessage',
    name: 'chat_message',
    data: {
      message_type: messageType,
      conversation_id: conversationId,
      message_length: messageLength,
      with_file_context: withFileContext,
    },
  });
}

// Track performance metric
export async function trackPerformance(
  name: string,
  value: number,
  category?: string
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    return;
  }
  
  await addToQueue({
    type: 'performance',
    name: 'performance',
    data: {
      metric_name: name,
      metric_value: value,
      metric_category: category,
    },
  });
}

// Export analytics module
const analytics = {
  initialize: initializeAnalytics,
  trackPageView,
  trackEvent,
  trackError,
  trackFileUpload,
  trackChatMessage,
  trackPerformance,
};

export default analytics;

// Type definitions for window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
