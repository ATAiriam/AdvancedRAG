import { useState, useCallback } from 'react';

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  lastModified: string;
  source: string;
  status: 'processing' | 'indexed' | 'error';
  tags: { id: string; name: string; color?: string }[];
  categories: { id: string; name: string; color?: string }[];
  [key: string]: any; // Allow other properties
}

const FILES_STORAGE_KEY = 'airiam-files';

export function useOfflineStorage() {
  const [offlineFilesMap, setOfflineFilesMap] = useState<Record<string, File>>(() => {
    if (typeof window === 'undefined') return {};
    
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      return storedFiles ? JSON.parse(storedFiles) : {};
    } catch (error) {
      console.error('Failed to load files from localStorage:', error);
      return {};
    }
  });

  // Save files to localStorage
  const saveFilesToOfflineStorage = useCallback((files: File[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      const filesMap = files.reduce((acc, file) => {
        // Only save files that are fully indexed
        if (file.status === 'indexed' || file.source === 'upload') {
          acc[file.id] = file;
        }
        return acc;
      }, {} as Record<string, File>);
      
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filesMap));
      setOfflineFilesMap(filesMap);
    } catch (error) {
      console.error('Failed to save files to localStorage:', error);
    }
  }, []);

  // Get all offline files
  const getOfflineFiles = useCallback(async (): Promise<File[]> => {
    if (typeof window === 'undefined') return [];
    
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      const filesMap = storedFiles ? JSON.parse(storedFiles) : {};
      return Object.values(filesMap);
    } catch (error) {
      console.error('Failed to get offline files:', error);
      return [];
    }
  }, []);

  // Get a specific file by ID
  const getOfflineFile = useCallback(async (fileId: string): Promise<File | null> => {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      const filesMap = storedFiles ? JSON.parse(storedFiles) : {};
      return filesMap[fileId] || null;
    } catch (error) {
      console.error(`Failed to get offline file with ID ${fileId}:`, error);
      return null;
    }
  }, []);

  // Check if a file is available offline
  const isFileAvailableOffline = useCallback((fileId: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      const filesMap = storedFiles ? JSON.parse(storedFiles) : {};
      return !!filesMap[fileId];
    } catch (error) {
      console.error(`Failed to check if file ${fileId} is available offline:`, error);
      return false;
    }
  }, []);

  // Remove a file from offline storage
  const removeFileFromOfflineStorage = useCallback((fileId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      const filesMap = storedFiles ? JSON.parse(storedFiles) : {};
      
      if (filesMap[fileId]) {
        delete filesMap[fileId];
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filesMap));
        setOfflineFilesMap(filesMap);
      }
    } catch (error) {
      console.error(`Failed to remove file ${fileId} from offline storage:`, error);
    }
  }, []);

  // Clear all offline stored files
  const clearOfflineStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(FILES_STORAGE_KEY);
      setOfflineFilesMap({});
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  }, []);

  return {
    saveFilesToOfflineStorage,
    getOfflineFiles,
    getOfflineFile,
    isFileAvailableOffline,
    removeFileFromOfflineStorage,
    clearOfflineStorage
  };
}