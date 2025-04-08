import { create } from 'zustand';

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  lastModified: string;
  source: string;
  isExternal: boolean;
  externalId?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'indexed' | 'error';
  errorMessage?: string;
  tags: { id: string; name: string; color?: string }[];
  categories: { id: string; name: string; color?: string }[];
  createdBy: string;
}

interface FetchFilesOptions {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  categories?: string[];
  refresh?: boolean;
}

interface UploadOptions {
  storeFullContent?: boolean;
  suggestTags?: boolean;
  onProgress?: (progress: number) => void;
}

interface FilesState {
  files: File[];
  selectedFileIds: string[];
  totalFiles: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchFiles: (options?: FetchFilesOptions) => Promise<void>;
  uploadFiles: (files: File[], options?: UploadOptions) => Promise<void>;
  deleteFiles: (fileIds: string[]) => Promise<void>;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  setPage: (page: number) => void;
}

// Utility function to generate a mock file
const generateMockFile = (index: number): File => {
  const fileTypes = ['pdf', 'docx', 'xlsx', 'jpg', 'png', 'txt'];
  const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
  const fileSize = Math.floor(Math.random() * 10000000) + 500000; // 500KB to 10MB
  const sources = ['upload', 'google-drive', 'onedrive', 'dropbox', 'sharepoint'];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const isExternal = source !== 'upload';
  const statusOptions = ['processing', 'indexed', 'error'];
  const status = Math.random() > 0.8 
    ? statusOptions[Math.floor(Math.random() * statusOptions.length)] 
    : 'indexed';
  
  return {
    id: `file-${index}`,
    name: `Document-${index}.${fileType}`,
    type: fileType,
    size: fileSize,
    uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
    lastModified: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString(),
    source,
    isExternal,
    externalId: isExternal ? `ext-${index}` : undefined,
    externalUrl: isExternal ? `https://example.com/files/${index}` : undefined,
    thumbnailUrl: ['jpg', 'png'].includes(fileType) ? `/api/placeholder/400/300?text=${encodeURIComponent(`Document-${index}.${fileType}`)}` : undefined,
    status,
    errorMessage: status === 'error' ? 'Failed to process document' : undefined,
    tags: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
      id: `tag-${index}-${i}`,
      name: ['Important', 'Draft', 'Final', 'Confidential', 'Archived', 'Financial'][Math.floor(Math.random() * 6)],
      color: ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#EC4899'][Math.floor(Math.random() * 6)]
    })),
    categories: Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
      id: `cat-${index}-${i}`,
      name: ['HR', 'Finance', 'Marketing', 'Legal', 'Operations', 'IT'][Math.floor(Math.random() * 6)],
      color: ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#EC4899'][Math.floor(Math.random() * 6)]
    })),
    createdBy: 'john.doe@example.com',
  };
};

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  selectedFileIds: [],
  totalFiles: 0,
  page: 1,
  limit: 12,
  loading: false,
  error: null,
  
  fetchFiles: async (options = {}) => {
    const { page = 1, limit = 12, search = '', tags = [], categories = [], refresh = false } = options;
    
    set({ loading: true, error: null, ...(refresh && { files: [] }) });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data
      const offset = (page - 1) * limit;
      const totalMockFiles = 48; // Simulate having 48 total files
      
      // Generate new batch of files
      const newFiles = Array.from({ length: Math.min(limit, totalMockFiles - offset) }, (_, i) => 
        generateMockFile(offset + i + 1)
      );
      
      set(state => ({
        files: refresh ? newFiles : [...state.files, ...newFiles],
        totalFiles: totalMockFiles,
        loading: false,
        page,
      }));
    } catch (error) {
      console.error('Error fetching files:', error);
      set({ loading: false, error: 'Failed to fetch files' });
    }
  },
  
  uploadFiles: async (files, options = {}) => {
    const { storeFullContent = false, suggestTags = true, onProgress } = options;
    
    try {
      // Simulate file upload progress
      const totalFiles = files.length;
      let processedFiles = 0;
      
      for (const file of files) {
        // Simulate file upload and processing
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        processedFiles++;
        if (onProgress) {
          onProgress((processedFiles / totalFiles) * 100);
        }
      }
      
      // Add files to the store
      const newFiles: File[] = Array.from(files).map((file, index) => ({
        id: `new-file-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        uploadDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        source: 'upload',
        isExternal: false,
        status: 'processing',
        tags: [],
        categories: [],
        createdBy: 'current.user@example.com',
      }));
      
      set(state => ({
        files: [...newFiles, ...state.files],
        totalFiles: state.totalFiles + newFiles.length,
      }));
      
      // Simulate processing completion after a delay
      setTimeout(() => {
        set(state => ({
          files: state.files.map(file => {
            if (newFiles.some(newFile => newFile.id === file.id)) {
              return {
                ...file,
                status: 'indexed',
                tags: suggestTags ? [
                  { id: `auto-tag-${file.id}-1`, name: 'Auto-tagged', color: '#34D399' }
                ] : []
              };
            }
            return file;
          })
        }));
      }, 5000);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    }
  },
  
  deleteFiles: async (fileIds) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        files: state.files.filter(file => !fileIds.includes(file.id)),
        selectedFileIds: state.selectedFileIds.filter(id => !fileIds.includes(id)),
        totalFiles: state.totalFiles - fileIds.length,
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting files:', error);
      set({ loading: false, error: 'Failed to delete files' });
      throw error;
    }
  },
  
  selectFile: (fileId) => {
    set(state => ({
      selectedFileIds: [...state.selectedFileIds, fileId]
    }));
  },
  
  deselectFile: (fileId) => {
    set(state => ({
      selectedFileIds: state.selectedFileIds.filter(id => id !== fileId)
    }));
  },
  
  selectAllFiles: () => {
    set(state => ({
      selectedFileIds: state.files.map(file => file.id)
    }));
  },
  
  deselectAllFiles: () => {
    set({ selectedFileIds: [] });
  },
  
  setPage: (page) => {
    set({ page });
  },
}));
