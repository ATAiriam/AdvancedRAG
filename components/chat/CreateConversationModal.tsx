'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createConversation, selectIsCreatingConversation } from '@/redux/slices/chatSlice';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { XMarkIcon, DocumentTextIcon, PlusIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FileContextFile } from '@/types/chat';
import { api } from '@/lib/api';

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum ModalView {
  FORM,
  FILE_SELECTION,
}

const CreateConversationModal: React.FC<CreateConversationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector(selectIsCreatingConversation);
  
  const [view, setView] = useState<ModalView>(ModalView.FORM);
  const [title, setTitle] = useState('New Conversation');
  const [selectedFiles, setSelectedFiles] = useState<FileContextFile[]>([]);
  const [allFiles, setAllFiles] = useState<FileContextFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileContextFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setView(ModalView.FORM);
      setTitle('New Conversation');
      setSelectedFiles([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (view === ModalView.FILE_SELECTION && isOpen) {
      fetchFiles();
    }
  }, [view, isOpen]);

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
    setIsLoadingFiles(true);
    try {
      // Only fetch indexed files that can be used for context
      const response = await api.get('/files', {
        params: { status: 'indexed', page: 1, limit: 100 }
      });
      
      const files = response.data.files.map((file: any) => ({
        ...file,
        isSelected: selectedFiles.some(selected => selected.id === file.id)
      }));
      
      setAllFiles(files);
      setFilteredFiles(files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!title.trim()) return;
    
    const fileContext = selectedFiles.map(file => file.id);
    const result = await dispatch(createConversation({ title, fileContext }));
    
    if (createConversation.fulfilled.match(result)) {
      onClose();
      // Navigate to the new conversation
      router.push(`/chat/${result.payload.id}`);
    }
  };

  const toggleFileSelection = (file: FileContextFile) => {
    if (selectedFiles.some(selected => selected.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(selected => selected.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
    
    // Update selected state in filtered files
    setFilteredFiles(
      filteredFiles.map(f => 
        f.id === file.id ? { ...f, isSelected: !f.isSelected } : f
      )
    );
    
    // Update selected state in all files
    setAllFiles(
      allFiles.map(f => 
        f.id === file.id ? { ...f, isSelected: !f.isSelected } : f
      )
    );
  };

  const removeSelectedFile = (file: FileContextFile) => {
    setSelectedFiles(selectedFiles.filter(selected => selected.id !== file.id));
    
    // Update all files array to show file as not selected
    setAllFiles(
      allFiles.map(f => 
        f.id === file.id ? { ...f, isSelected: false } : f
      )
    );
    
    // Update filtered files
    setFilteredFiles(
      filteredFiles.map(f => 
        f.id === file.id ? { ...f, isSelected: false } : f
      )
    );
  };

  const handleDone = () => {
    setView(ModalView.FORM);
  };

  // Render the conversation form view
  const renderFormView = () => (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Conversation</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="conversation-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conversation Title
            </label>
            <Input
              id="conversation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this conversation"
              className="mt-1 w-full"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Context Files
              </label>
              <Button
                onClick={() => setView(ModalView.FILE_SELECTION)}
                variant="secondary"
                size="sm"
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Select Files
              </Button>
            </div>

            {selectedFiles.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded shadow-sm"
                  >
                    <div className="flex items-center truncate">
                      <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate" title={file.name}>{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(file)}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none flex-shrink-0"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No files selected. Add files to provide context for the conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateConversation} 
          disabled={!title.trim() || isCreating}
          className="flex items-center"
        >
          {isCreating ? <Loader size="small" className="mr-2" /> : null}
          Create
        </Button>
      </div>
    </>
  );

  // Render the file selection view
  const renderFileSelectionView = () => (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Files</h2>
          <button
            onClick={() => setView(ModalView.FORM)}
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

        {isLoadingFiles ? (
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