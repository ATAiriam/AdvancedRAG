'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateContextFiles, selectCurrentConversation } from '@/redux/slices/chatSlice';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { XMarkIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FileContextFile } from '@/types/chat';
import { api } from '@/lib/api';

interface FileContextSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileContextSelector: React.FC<FileContextSelectorProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentConversation = useAppSelector(selectCurrentConversation);
  
  const [allFiles, setAllFiles] = useState<FileContextFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileContextFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && currentConversation) {
      fetchFiles();
      
      // Initialize selected files from conversation context
      if (currentConversation.fileContext) {
        setSelectedFileIds(currentConversation.fileContext);
      } else {
        setSelectedFileIds([]);
      }
    }
  }, [isOpen, currentConversation]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredFiles(
        allFiles.filter(file => 
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredFiles(allFiles);
    }
  }, [searchTerm, allFiles]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // Only fetch indexed files that can be used for context
      const response = await api.get('/files', {
        params: { status: 'indexed', page: 1, limit: 100 }
      });
      
      const files = response.data.files;
      setAllFiles(files);
      setFilteredFiles(files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    if (selectedFileIds.includes(fileId)) {
      setSelectedFileIds(selectedFileIds.filter(id => id !== fileId));
    } else {
      setSelectedFileIds([...selectedFileIds, fileId]);
    }
  };

  const handleSave = async () => {
    if (!currentConversation) return;
    
    setIsSaving(true);
    try {
      await dispatch(updateContextFiles({
        conversationId: currentConversation.id,
        fileContext: selectedFileIds
      }));
      onClose();
    } catch (error) {
      console.error('Failed to update context files:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Files for Context
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="medium" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No files match your search" : "No indexed files available"}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 gap-2 p-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => toggleFileSelection(file.id)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedFileIds.includes(file.id)
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`
                      h-5 w-5 rounded-full border flex items-center justify-center
                      ${selectedFileIds.includes(file.id)
                        ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                        : 'border-gray-300 dark:border-gray-500'
                      }
                    `}>
                      {selectedFileIds.includes(file.id) && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.size && `${Math.round(file.size / 1024)} KB`}
                        </p>
                        {file.lastModified && (
                          <>
                            <span className="mx-1 text-gray-300 dark:text-gray-700">•</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Modified {new Date(file.lastModified).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? <Loader size="small" className="mr-2" /> : null}
          Save ({selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'})
        </Button>
      </div>
    </Modal>
  );
};

export default FileContextSelector;
