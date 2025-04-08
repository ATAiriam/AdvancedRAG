import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import { Grid, List, Plus, Trash, LayoutGrid, LayoutList } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { AddFilesModal } from '@/components/file-analysis/add-files-modal';
import { FileGrid } from '@/components/file-analysis/file-grid';
import { FileList } from '@/components/file-analysis/file-list';
import { EmptyState } from '@/components/file-analysis/empty-state';
import { DeleteConfirmationDialog } from '@/components/file-analysis/delete-confirmation-dialog';
import { FileSkeleton } from '@/components/file-analysis/file-skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useFilesStore } from '@/stores/files-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { useOfflineStorage } from '@/hooks/use-offline-storage';

const FileAnalysisPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { trackEvent } = useAnalytics();
  const { ref, inView } = useInView();
  const { saveFilesToOfflineStorage, getOfflineFiles } = useOfflineStorage();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Files store
  const {
    files,
    selectedFileIds,
    totalFiles,
    page,
    limit,
    loading,
    fetchFiles,
    selectFile,
    deselectFile,
    selectAllFiles,
    deselectAllFiles,
    deleteFiles,
    setPage,
  } = useFilesStore();

  // Check online status
  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadFiles = async () => {
      if (isOffline) {
        // Load files from offline storage
        const offlineFiles = await getOfflineFiles();
        // Set files in the store
        // This would need to be implemented in your store
        setIsInitialLoading(false);
      } else {
        await fetchFiles({
          page: 1,
          limit,
          refresh: true,
        });
        setIsInitialLoading(false);
      }
    };

    loadFiles();
  }, [fetchFiles, isOffline, limit, getOfflineFiles]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && !loading && !isInitialLoading && files.length < totalFiles && !isOffline) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      
      fetchFiles({
        page: nextPage,
        limit,
      }).finally(() => {
        setIsLoadingMore(false);
        setPage(nextPage);
      });
    }
  }, [inView, loading, isInitialLoading, files.length, totalFiles, isOffline, fetchFiles, page, limit, setPage]);

  // Save files to offline storage when they change
  useEffect(() => {
    if (!isOffline && files.length > 0) {
      saveFilesToOfflineStorage(files);
    }
  }, [files, isOffline, saveFilesToOfflineStorage]);

  // Handlers
  const handleAddFiles = () => {
    setIsAddFilesModalOpen(true);
    trackEvent('add_files_button_clicked');
  };

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
    trackEvent('delete_files_button_clicked', { count: selectedFileIds.length });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFiles(selectedFileIds);
      toast({
        title: 'Files deleted',
        description: `${selectedFileIds.length} files have been deleted.`,
      });
      trackEvent('files_deleted', { count: selectedFileIds.length });
    } catch (error) {
      console.error('Error deleting files:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the files.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleViewFile = (fileId: string) => {
    router.push(`/files/${fileId}`);
    trackEvent('file_viewed', { fileId });
  };

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    trackEvent('view_mode_changed', { mode });
  };

  // Render
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">File Analysis</h1>
        <div className="flex space-x-2">
          {selectedFileIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
              <span>{selectedFileIds.length}</span>
            </Button>
          )}
          <Button 
            onClick={handleAddFiles}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Files</span>
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex justify-end">
        <div className="border rounded-md flex overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            className="rounded-none p-2 h-9"
            onClick={() => handleToggleViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            className="rounded-none p-2 h-9"
            onClick={() => handleToggleViewMode('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Display Area */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <FileSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <EmptyState onAddFiles={handleAddFiles} />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <FileGrid
              files={files}
              selectedFileIds={selectedFileIds}
              onSelect={selectFile}
              onDeselect={deselectFile}
              onView={handleViewFile}
              isOffline={isOffline}
            />
          ) : (
            <FileList
              files={files}
              selectedFileIds={selectedFileIds}
              onSelect={selectFile}
              onDeselect={deselectFile}
              onSelectAll={selectAllFiles}
              onDeselectAll={deselectAllFiles}
              onView={handleViewFile}
              isOffline={isOffline}
            />
          )}
          
          {/* Load more trigger */}
          {!isOffline && files.length < totalFiles && (
            <div ref={ref} className="py-4 flex justify-center">
              {isLoadingMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <FileSkeleton key={`load-more-${index}`} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Offline banner */}
          {isOffline && (
            <div className="bg-amber-100 text-amber-800 p-4 rounded-md mt-4 text-center">
              You are currently offline. Some features may be limited.
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddFilesModal
        isOpen={isAddFilesModalOpen}
        onClose={() => setIsAddFilesModalOpen(false)}
      />
      
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        count={selectedFileIds.length}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default FileAnalysisPage;
