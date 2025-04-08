import { useState, useCallback } from 'react';
import { create } from 'zustand';

interface File {
  id: string;
  name: string;
  tags: { id: string; name: string; color?: string }[];
  categories: { id: string; name: string; color?: string }[];
  [key: string]: any; // Allow other properties
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagsModalStore {
  isOpen: boolean;
  file: File | null;
  type: 'tags' | 'categories';
  open: (file: File, type?: 'tags' | 'categories') => void;
  close: () => void;
  saveChanges: (fileId: string, items: Tag[], type: 'tags' | 'categories') => Promise<void>;
}

// Create a store for managing the tags modal state
const useTagsModalStore = create<TagsModalStore>((set, get) => ({
  isOpen: false,
  file: null,
  type: 'tags',
  
  open: (file, type = 'tags') => set({ isOpen: true, file, type }),
  
  close: () => set({ isOpen: false }),
  
  saveChanges: async (fileId, items, type) => {
    // Mock API call to save changes
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Saved ${type} for file ${fileId}:`, items);
      
      // Close the modal after successful save
      set({ isOpen: false });
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      throw error;
    }
  }
}));

// Hook to use the tags modal
export function useTagsModal() {
  const { isOpen, file, type, open, close, saveChanges } = useTagsModalStore();
  
  const openTagsModal = useCallback((file: File, type: 'tags' | 'categories' = 'tags') => {
    open(file, type);
  }, [open]);
  
  return {
    isOpen,
    file,
    type,
    openTagsModal,
    closeTagsModal: close,
    saveChanges
  };
}
