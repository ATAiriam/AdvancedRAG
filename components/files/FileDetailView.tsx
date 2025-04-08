import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { 
  ChevronLeft, 
  Download, 
  ExternalLink, 
  Trash, 
  Pencil, 
  RefreshCw, 
  MessageSquare,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FilePdf,
  FileArchive,
  Tag,
  FolderOpen,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTagsModal } from '@/hooks/use-tags-modal';
import { useOfflineStorage } from '@/hooks/use-offline-storage';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn, formatFileSize, formatRelativeDate } from '@/lib/utils';
import { TagsSection } from '@/components/file-analysis/tags-section';
import { CategoriesSection } from '@/components/file-analysis/categories-section';
import { DocumentViewer } from '@/components/file-analysis/document-viewer';
import { DeleteConfirmationDialog } from '@/components/file-analysis/delete-confirmation-dialog';

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
  tags: { id: string; name: string; color?: string; confidence?: number; approved?: boolean }[];
  categories: { id: string; name: string; color?: string }[];
  createdBy: string;
}

interface FileDetailViewProps {
  fileId: string;
}

export const FileDetailView: React.FC<FileDetailViewProps> = ({ fileId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { trackEvent } = useAnalytics();
  const { openTagsModal } = useTagsModal();
  const { isFileAvailableOffline, getOfflineFile } = useOfflineStorage();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [aiSuggestedTags, setAiSuggestedTags] = useState<{ id: string; name: string; color?: string; confidence: number }[]>([]);
  
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

  // Fetch file data
  useEffect(() => {
    const fetchFileData = async () => {
      setLoading(true);
      
      try {
        if (isOffline) {
          // Try to get file from offline storage
          const offlineFile = await getOfflineFile(fileId);
          if (offlineFile) {
            setFile(offlineFile);
          } else {
            toast({
              title: 'File unavailable offline',
              description: 'This file is not available in offline mode.',
              variant: 'destructive',
            });
            router.push('/files');
          }
        } else {
          // Mock API call to fetch file data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock file data
          const mockFile: File = {
            id: fileId,
            name: 'Annual Report 2024.pdf',
            type: 'pdf',
            size: 2458000,
            uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(),
            lastModified: new Date(Date.now() - 86400000 * 2).toISOString(),
            source: Math.random() > 0.5 ? 'upload' : 'google-drive',
            isExternal: Math.random() > 0.5,
            externalId: 'doc-123456',
            externalUrl: 'https://drive.google.com/file/d/123456',
            status: Math.random() > 0.8 ? 'processing' : (Math.random() > 0.9 ? 'error' : 'indexed'),
            errorMessage: 'Failed to process document due to corrupted content.',
            tags: [
              { id: 't1', name: 'Finance', color: '#34D399' },
              { id: 't2', name: 'Report', color: '#60A5FA' },
              { id: 't3', name: 'Annual', color: '#F87171' },
            ],
            categories: [
              { id: 'c1', name: 'Financial', color: '#8B5CF6' },
              { id: 'c2', name: 'Corporate', color: '#FBBF24' },
            ],
            createdBy: 'john.doe@example.com',
          };
          
          setFile(mockFile);
          
          // If the file is indexed, get AI suggested tags
          if (mockFile.status === 'indexed') {
            // Mock suggested tags
            const mockSuggestedTags = [
              { id: 'st1', name: 'Budget', color: '#A78BFA', confidence: 0.92 },
              { id: 'st2', name: 'Q4', color: '#34D399', confidence: 0.78 },
              { id: 'st3', name: 'Projections', color: '#F59E0B', confidence: 0.65 },
            ];
            
            setAiSuggestedTags(mockSuggestedTags);
          }
        }
        
        trackEvent('file_detail_viewed', { fileId });
      } catch (error) {
        console.error('Error fetching file:', error);
        toast({
          title: 'Error loading file',
          description: 'Could not load the file details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileData();
  }, [fileId, getOfflineFile, isOffline, router, toast, trackEvent]);

  // Handlers
  const handleUpdateFile = async () => {
    setIsProcessing(true);
    
    try {
      // Mock API call to reprocess file
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update file status
      setFile(prev => prev ? {
        ...prev,
        status: 'processing'
      } : null);
      
      toast({
        title: 'File update initiated',
        description: 'The file is being reprocessed.',
      });
      
      trackEvent('file_reprocessed', { fileId });
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        title: 'Update failed',
        description: 'Could not reprocess the file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = async () => {
    try {
      // Mock API call to delete file
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
      });
      
      trackEvent('file_deleted', { fileId });
      
      // Navigate back to file list
      router.push('/files');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Deletion failed',
        description: 'Could not delete the file.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownloadFile = () => {
    // Mock download functionality
    toast({
      title: 'Download started',
      description: 'Your file is being downloaded.',
    });
    
    trackEvent('file_downloaded', { fileId });
  };

  const handleCreateChat = () => {
    // Navigate to chat with this file as context
    router.push(`/chat?fileContext=${fileId}`);
    trackEvent('chat_with_file_initiated', { fileId });
  };

  const handleAcceptTag = (tagId: string) => {
    // Accept AI suggested tag
    const tagToAccept = aiSuggestedTags.find(tag => tag.id === tagId);
    
    if (tagToAccept && file) {
      // Add to file tags and remove from suggestions
      setFile({
        ...file,
        tags: [...file.tags, { ...tagToAccept, approved: true }]
      });
      
      setAiSuggestedTags(aiSuggestedTags.filter(tag => tag.id !== tagId));
      
      toast({
        title: 'Tag accepted',
        description: `Tag "${tagToAccept.name}" has been added to the file.`,
      });
      
      trackEvent('ai_tag_accepted', { tagId, tagName: tagToAccept.name });
    }
  };

  const handleRejectTag = (tagId: string) => {
    // Reject AI suggested tag
    const tagToReject = aiSuggestedTags.find(tag => tag.id === tagId);
    
    if (tagToReject) {
      setAiSuggestedTags(aiSuggestedTags.filter(tag => tag.id !== tagId));
      
      toast({
        title: 'Tag rejected',
        description: `Tag "${tagToReject.name}" has been rejected.`,
      });
      
      trackEvent('ai_tag_rejected', { tagId, tagName: tagToReject.name });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="h-10 w-10 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="h-10 w-10 text-blue-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return <FileArchive className="h-10 w-10 text-orange-500" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return <FileCode className="h-10 w-10 text-purple-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: 'processing' | 'indexed' | 'error') => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'indexed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Indexed
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If file not found
  if (!file) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => router.push('/files')} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Files
        </Button>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">File Not Found</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              The file you are looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/files')}>
              Go to File List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render file detail view
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/files')} className="h-9">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back to Files</span>
          </Button>
          
          {getStatusBadge(file.status)}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!isMobile ? (
            <>
              <Button
                variant="outline"
                onClick={handleDownloadFile}
                disabled={isOffline && file.source !== 'upload'}
                className="gap-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              
              <Button
                variant="outline"
                onClick={handleUpdateFile}
                disabled={isProcessing || isOffline}
                className="gap-1"
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isProcessing && "animate-spin")} />
                {isProcessing ? 'Updating...' : 'Update'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCreateChat}
                disabled={isOffline || file.status !== 'indexed'}
                className="gap-1"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Use in Chat
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isOffline}
                className="gap-1"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Sliders className="h-4 w-4 mr-1" />
                  Actions
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>File Actions</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    onClick={handleDownloadFile}
                    disabled={isOffline && file.source !== 'upload'}
                    className="justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleUpdateFile}
                    disabled={isProcessing || isOffline}
                    className="justify-start"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isProcessing && "animate-spin")} />
                    {isProcessing ? 'Updating...' : 'Update'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCreateChat}
                    disabled={isOffline || file.status !== 'indexed'}
                    className="justify-start"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Use in Chat
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isOffline}
                    className="justify-start"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* File title and info */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-muted rounded-md hidden sm:block">
          {getFileIcon(file.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md sm:hidden">
              {getFileIcon(file.type)}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold truncate" title={file.name}>
              {file.name}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            <div>Size: {formatFileSize(file.size)}</div>
            <div>Uploaded: {formatRelativeDate(file.uploadDate)}</div>
            <div>
              Source: {file.source === 'upload' ? 'Local Upload' : file.source.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
          </div>
        </div>
      </div>

      {/* Error alert if needed */}
      {file.status === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription>
            {file.errorMessage || 'There was an error processing this file. Try updating the file to reprocess it.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File preview / document viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Document Preview</span>
                
                {file.isExternal && file.externalUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(file.externalUrl, '_blank')}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in {file.source.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="m-0">
                    <div className="h-[400px] bg-muted/30 rounded-md overflow-hidden">
                      <DocumentViewer 
                        file={file} 
                        isLoading={false} 
                        isOffline={isOffline} 
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="m-0">
                    <div className="space-y-6">
                      {/* Tags */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            Tags
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openTagsModal(file)}
                            disabled={isOffline}
                            className="h-7 px-2"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {file.tags.length > 0 ? (
                            file.tags.map(tag => (
                              <Badge 
                                key={tag.id} 
                                variant="outline"
                                className="bg-primary/10"
                                style={{ borderColor: tag.color }}
                              >
                                {tag.name}
                                {tag.approved && (
                                  <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                                )}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No tags applied</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Categories */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium flex items-center gap-1">
                            <FolderOpen className="h-4 w-4" />
                            Categories
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openTagsModal(file, 'categories')}
                            disabled={isOffline}
                            className="h-7 px-2"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {file.categories.length > 0 ? (
                            file.categories.map(category => (
                              <Badge 
                                key={category.id} 
                                variant="outline"
                                className="bg-primary/10"
                                style={{ borderColor: category.color }}
                              >
                                {category.name}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No categories applied</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Source Info */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Source Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Source:</span>
                            <span>{file.source === 'upload' ? 'Local Upload' : file.source.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                          </div>
                          
                          {file.isExternal && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">External ID:</span>
                              <span className="font-mono text-xs">{file.externalId}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created by:</span>
                            <span>{file.createdBy}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Upload date:</span>
                            <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last modified:</span>
                            <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-[600px] bg-muted/30 rounded-md overflow-hidden">
                  <DocumentViewer 
                    file={file} 
                    isLoading={false} 
                    isOffline={isOffline} 
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata panel (desktop only) */}
        {!isMobile && (
          <div className="space-y-6">
            {/* Tags section */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openTagsModal(file)}
                    disabled={isOffline}
                    className="h-7 px-2"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {file.tags.length > 0 ? (
                    file.tags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        className="bg-primary/10"
                        style={{ borderColor: tag.color }}
                      >
                        {tag.name}
                        {tag.approved && (
                          <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags applied</p>
                  )}
                </div>
                
                {/* AI Tag suggestions */}
                {aiSuggestedTags.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">AI Suggested Tags</h4>
                    <div className="space-y-2">
                      {aiSuggestedTags.map(tag => (
                        <div key={tag.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className="bg-primary/10"
                              style={{ borderColor: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(tag.confidence * 100)}% confidence
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleAcceptTag(tag.id)}
                              className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRejectTag(tag.id)}
                              className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Categories section */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-4 w-4" />
                    Categories
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openTagsModal(file, 'categories')}
                    disabled={isOffline}
                    className="h-7 px-2"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {file.categories.length > 0 ? (
                    file.categories.map(category => (
                      <Badge 
                        key={category.id} 
                        variant="outline"
                        className="bg-primary/10"
                        style={{ borderColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories applied</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Source information */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Source Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Source:</span>
                    <span>{file.source === 'upload' ? 'Local Upload' : file.source.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </div>
                  
                  {file.isExternal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">External ID:</span>
                      <span className="font-mono text-xs">{file.externalId}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created by:</span>
                    <span>{file.createdBy}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Upload date:</span>
                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last modified:</span>
                    <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                  </div>
                  
                  {file.isExternal && file.externalUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(file.externalUrl, '_blank')}
                      className="w-full mt-2 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in {file.source.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteFile}
        count={1}
        fileName={file.name}
      />
    </div>
  );
};