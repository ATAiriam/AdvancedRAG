import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { ChevronLeft, FileText, Folder, Lock, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatFileSize, formatRelativeDate } from '@/lib/utils';

type CloudProvider = 'google-drive' | 'onedrive' | 'dropbox' | 'sharepoint';

interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  modifiedDate?: string;
  path?: string;
  selected?: boolean;
}

interface CloudProviderBrowserProps {
  provider: CloudProvider;
  onBack: () => void;
  onSelect: (files: CloudFile[]) => void;
  storeFullContent: boolean;
  suggestTags: boolean;
}

export const CloudProviderBrowser: React.FC<CloudProviderBrowserProps> = ({
  provider,
  onBack,
  onSelect,
  storeFullContent,
  suggestTags
}) => {
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { trackEvent } = useAnalytics();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<CloudFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([{id: 'root', name: 'Root'}]);

  // Mock authentication function - in a real app this would use the OAuth flow
  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    trackEvent('cloud_auth_started', { provider });

    try {
      // Simulate API call for authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsAuthenticated(true);
      toast({
        title: 'Connected successfully',
        description: `Your ${getProviderName(provider)} account has been connected.`
      });
      trackEvent('cloud_auth_completed', { provider, success: true });
      
      // Load initial files after authentication
      loadFiles('root');
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication failed',
        description: `Could not connect to ${getProviderName(provider)}.`,
        variant: 'destructive'
      });
      trackEvent('cloud_auth_completed', { provider, success: false });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Helper function to get provider display name
  const getProviderName = (provider: CloudProvider): string => {
    switch (provider) {
      case 'google-drive': return 'Google Drive';
      case 'onedrive': return 'OneDrive';
      case 'dropbox': return 'Dropbox';
      case 'sharepoint': return 'SharePoint';
    }
  };

  // Mock function to load files - in a real app this would call the provider's API
  const loadFiles = async (folderId: string, folderName?: string) => {
    setIsLoading(true);
    trackEvent('cloud_folder_opened', { provider, folderId });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock files based on the provider
      const mockFiles: CloudFile[] = [];
      
      // Add folders
      for (let i = 1; i <= 3; i++) {
        mockFiles.push({
          id: `folder-${folderId}-${i}`,
          name: `Folder ${i}`,
          type: 'folder',
          modifiedDate: new Date(Date.now() - i * 86400000).toISOString(),
        });
      }
      
      // Add files
      const fileTypes = [
        { ext: 'pdf', mime: 'application/pdf' },
        { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { ext: 'txt', mime: 'text/plain' },
        { ext: 'jpg', mime: 'image/jpeg' }
      ];
      
      for (let i = 1; i <= 7; i++) {
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        mockFiles.push({
          id: `file-${folderId}-${i}`,
          name: `Document ${i}.${fileType.ext}`,
          type: 'file',
          size: Math.floor(Math.random() * 5000000), // Random size up to 5MB
          mimeType: fileType.mime,
          modifiedDate: new Date(Date.now() - i * 43200000).toISOString(),
        });
      }
      
      setFiles(mockFiles);
      
      // Update breadcrumbs if navigating to a subfolder
      if (folderId !== 'root' && folderName) {
        setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
      }
      
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error loading files',
        description: 'Could not load files from the cloud provider.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to a folder
  const handleFolderClick = (file: CloudFile) => {
    if (file.type === 'folder') {
      loadFiles(file.id, file.name);
    }
  };

  // Navigate using breadcrumbs
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    loadFiles(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  // Toggle file selection
  const handleFileSelect = (file: CloudFile) => {
    if (file.type === 'file') {
      setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        } else {
          return [...prev, file];
        }
      });
    }
  };

  // Submit selected files
  const handleImportFiles = () => {
    onSelect(selectedFiles);
    trackEvent('cloud_files_imported', { 
      provider, 
      count: selectedFiles.length,
      storeFullContent,
      suggestTags
    });
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles('root');
    }
  }, [isAuthenticated]);

  // Define columns for the data table
  const columns: ColumnDef<CloudFile>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getFilteredSelectedRowModel().rows.length > 0 &&
            table.getFilteredSelectedRowModel().rows.length === table.getFilteredRowModel().rows.length
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        return row.original.type === 'file' ? (
          <Checkbox
            checked={selectedFiles.some(f => f.id === row.original.id)}
            onCheckedChange={() => handleFileSelect(row.original)}
            aria-label="Select row"
          />
        ) : null;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => file.type === 'folder' && handleFolderClick(file)}
          >
            {file.type === 'folder' ? (
              <Folder className="h-4 w-4 text-blue-500" />
            ) : (
              <FileText className="h-4 w-4 text-gray-500" />
            )}
            <span className={file.type === 'folder' ? 'font-medium' : ''}>
              {file.name}
            </span>
          </div>
        );

  // If not authenticated, show auth screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Connect to {getProviderName(provider)}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Securely connect to your {getProviderName(provider)} account to access your files.
            We only request read access to the files you select.
          </p>
        </div>
        <Button 
          onClick={handleAuthenticate} 
          disabled={isAuthenticating}
          className="min-w-[180px]"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>Connect {getProviderName(provider)}</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back and breadcrumbs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {isMobile ? '' : 'Back'}
        </Button>

        {/* Breadcrumbs */}
        <Breadcrumb className="overflow-x-auto py-1">
          {breadcrumbs.map((crumb, i) => (
            <BreadcrumbItem key={crumb.id}>
              {i < breadcrumbs.length - 1 ? (
                <BreadcrumbLink 
                  className="text-sm"
                  onClick={() => handleBreadcrumbClick(i)}
                >
                  {crumb.name}
                </BreadcrumbLink>
              ) : (
                <span className="text-sm font-medium">{crumb.name}</span>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </div>

      {/* File browser */}
      <div>
        {isMobile ? (
          renderMobileGrid()
        ) : (
          <DataTable
            columns={columns}
            data={files}
            loading={isLoading}
            onRowClick={(row) => row.original.type === 'folder' && handleFolderClick(row.original)}
          />
        )}
      </div>

      {/* Empty state */}
      {!isLoading && files.length === 0 && (
        <div className="text-center py-8">
          <Folder className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-2 text-base font-medium">No files found</h3>
          <p className="text-sm text-muted-foreground">This folder is empty</p>
        </div>
      )}

      {/* Selected files count */}
      {selectedFiles.length > 0 && (
        <div className="sticky bottom-0 pt-2 pb-2 bg-background/80 backdrop-blur-sm border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
            <Button 
              onClick={handleImportFiles}
              size="sm"
            >
              <Check className="mr-1 h-4 w-4" />
              Import Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
      },
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => {
        const size = row.original.size;
        return size ? formatFileSize(size) : '';
      },
    },
    {
      accessorKey: 'modifiedDate',
      header: 'Modified',
      cell: ({ row }) => {
        const date = row.original.modifiedDate;
        return date ? formatRelativeDate(date) : '';
      },
    },
  ];

  // Mobile grid view render
  const renderMobileGrid = () => (
    <div className="grid grid-cols-2 gap-3 mt-4 pb-2">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-md p-3 space-y-2">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ))
      ) : (
        files.map(file => (
          <div 
            key={file.id} 
            className={`border rounded-md p-3 space-y-2 ${
              file.type === 'folder' ? 'cursor-pointer hover:bg-muted' : ''
            }`}
            onClick={() => file.type === 'folder' && handleFolderClick(file)}
          >
            <div className="flex justify-between items-start">
              {file.type === 'folder' ? (
                <Folder className="h-6 w-6 text-blue-500" />
              ) : (
                <FileText className="h-6 w-6 text-gray-500" />
              )}
              
              {file.type === 'file' && (
                <Checkbox
                  checked={selectedFiles.some(f => f.id === file.id)}
                  onCheckedChange={(e) => {
                    e.stopPropagation();
                    handleFileSelect(file);
                  }}
                  aria-label="Select file"
                  className="h-4 w-4"
                />
              )}
            </div>
            
            <div className="truncate text-sm font-medium">{file.name}</div>
            
            {file.type === 'file' && file.size && (
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </div>
            )}
            
            {file.modifiedDate && (
              <div className="text-xs text-muted-foreground">
                {formatRelativeDate(file.modifiedDate)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );