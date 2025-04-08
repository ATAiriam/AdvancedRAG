import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { Message, Conversation, MessageRequest } from '@/types/chat';
import { RootState } from '../store';

// Define the initial state
interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  isCreatingConversation: boolean;
  isSendingMessage: boolean;
  error: string | null;
  offlineQueue: { conversationId: string; message: MessageRequest }[];
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isCreatingConversation: false,
  isSendingMessage: false,
  error: null,
  offlineQueue: [],
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch conversation');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ title, fileContext }: { title: string; fileContext?: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.post('/conversations', { title, fileContext });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create conversation');
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete conversation');
    }
  }
);

export const updateContextFiles = createAsyncThunk(
  'chat/updateContextFiles',
  async (
    { conversationId, fileContext }: { conversationId: string; fileContext: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/conversations/${conversationId}/context`, { fileContext });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update context files');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { conversationId, content }: { conversationId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to send message');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMessageToQueue: (state, action: PayloadAction<{ conversationId: string; message: MessageRequest }>) => {
      state.offlineQueue.push(action.payload);
    },
    removeMessageFromQueue: (state, action: PayloadAction<number>) => {
      state.offlineQueue.splice(action.payload, 1);
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
      state.currentConversation = action.payload;
    },
    // Optimistic update for conversation messages - used when offline
    addMessageOptimistic: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (state.currentConversation?.id === conversationId) {
        state.currentConversation.messages.push(message);
      }
      
      // Update the message in the conversations list too
      const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
      if (conversationIndex !== -1) {
        // If the conversation contains messages array, update it
        if (state.conversations[conversationIndex].messages) {
          state.conversations[conversationIndex].messages.push(message);
        }
        
        // Update updatedAt for the conversation
        state.conversations[conversationIndex].updatedAt = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // fetchConversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // createConversation
      .addCase(createConversation.pending, (state) => {
        state.isCreatingConversation = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isCreatingConversation = false;
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isCreatingConversation = false;
        state.error = action.payload as string;
      })
      
      // deleteConversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter((conv) => conv.id !== action.payload);
        if (state.currentConversation?.id === action.payload) {
          state.currentConversation = null;
        }
      })
      
      // updateContextFiles
      .addCase(updateContextFiles.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
        
        // Update fileContext in the conversations list as well
        const conversationIndex = state.conversations.findIndex(
          (conv) => conv.id === action.payload.id
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].fileContext = action.payload.fileContext;
        }
      })
      
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        if (state.currentConversation) {
          state.currentConversation.messages.push(action.payload);
          
          // Update the updated_at timestamp
          state.currentConversation.updatedAt = new Date().toISOString();
          
          // Find and update the conversation in the conversations list
          const conversationIndex = state.conversations.findIndex(
            (conv) => conv.id === state.currentConversation?.id
          );
          if (conversationIndex !== -1) {
            state.conversations[conversationIndex].updatedAt = state.currentConversation.updatedAt;
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  clearCurrentConversation,
  clearError,
  addMessageToQueue,
  removeMessageFromQueue,
  setCurrentConversation,
  addMessageOptimistic
} = chatSlice.actions;

// Selectors
export const selectConversations = (state: RootState) => state.chat.conversations;
export const selectCurrentConversation = (state: RootState) => state.chat.currentConversation;
export const selectIsLoading = (state: RootState) => state.chat.isLoading;
export const selectIsSendingMessage = (state: RootState) => state.chat.isSendingMessage;
export const selectIsCreatingConversation = (state: RootState) => state.chat.isCreatingConversation;
export const selectChatError = (state: RootState) => state.chat.error;
export const selectOfflineQueue = (state: RootState) => state.chat.offlineQueue;

export default chatSlice.reducer;
