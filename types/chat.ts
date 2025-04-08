export interface MessageSource {
  fileId: string;
  fileName: string;
  snippet: string;
  page?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sources?: MessageSource[];
  status?: 'sending' | 'sent' | 'error' | 'queued';
}

export interface MessageRequest {
  content: string;
  fileContext?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  fileContext?: string[];
}

export interface FileContextFile {
  id: string;
  name: string;
  size?: number;
  type?: string;
  lastModified?: string;
  isSelected?: boolean;
}

export interface ChatAnalytics {
  conversationCount: number;
  messageCount: number;
  averageMessagesPerConversation: number;
  averageResponseTime: number; // in milliseconds
  topContextFiles: {
    fileId: string;
    fileName: string;
    useCount: number;
  }[];
}
