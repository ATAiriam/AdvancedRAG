import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, X, Upload, Cloud, FileText, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CloudProviderBrowser } from '@/components/file-analysis/cloud-provider-browser';
import { useFilesStore } from '@/stores/files-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatFileSize } from '@/lib/utils';

interface AddFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CloudProvider = 'google-drive' | 'onedrive' | 'dropbox' | 'sharepoint';

export const AddFilesModal: React.FC<AddFilesModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { trackEvent } = useAnalytics();
  const [activeTab, setActiveTab] = useState<'upload' | 'cloud'>('upload');
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storeFullContent, setStoreFullContent] = useState(false);
  const [suggestTags, setSuggestTags] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFiles } = useFilesStore();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    'text/markdown',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        if (errors.some(e => e.code === 'file-too-large')) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds the 50MB size limit.`,
            variant: 'destructive',
          });
        } else if (errors.some(e => e.code === 'file-invalid-type')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not a supported file type.`,
            variant: 'destructive',
          });
        }
      });
    }

    // Update selected files
    setSelectedFiles(prev => {
      // Filter out duplicates
      const newFiles = acceptedFiles.filter(
        newFile => !prev.some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size
        )
      );
      
      return [...prev, ...newFiles];
    });
    
    trackEvent('files_selected', { count: acceptedFiles.length, source: 'dropzone' });
  }, [toast, trackEvent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: ACCEPTED_FILE_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  const handleCaptureClick = () => {
    if (captureInputRef.current) {
      captureInputRef.current.click();
    }
    setIsCapturing(true);
  };

  const handleCaptureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const capturedFiles = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...capturedFiles]);
      trackEvent('files_captured', { count: capturedFiles.length, source: 'camera' });
    }
    setIsCapturing(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProviderSelect = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    trackEvent('cloud_provider_selected', { provider });
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 && !selectedProvider) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (activeTab === 'upload') {
        // Simulate progress updates
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + Math.random() * 10;
            return newProgress > 95 ? 95 : newProgress;
          });
        }, 300);

        // Upload files
        await uploadFiles(selectedFiles, {
          storeFullContent,
          suggestTags,
          onProgress: (progress) => {
            clearInterval(interval);
            setUploadProgress(progress);
          }
        });

        clearInterval(interval);
        setUploadProgress(100);
        
        toast({
          title: 'Files uploaded',
          description: `${selectedFiles.length} files have been uploaded successfully.`,
        });
        
        trackEvent('files_uploaded', { 
          count: selectedFiles.length, 
          storeFullContent, 
          suggestTags 
        });
        
        setTimeout(() => {
          setSelectedFiles([]);
          onClose();
        }, 1000);
      } else if (activeTab === 'cloud' && selectedProvider) {
        // This would be handled by the CloudProviderBrowser component
        toast({
          title: 'Files connected',
          description: 'Selected files have been connected successfully.',
        });
        
        setTimeout(() => {
          setSelectedProvider(null);
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: 'There was a problem uploading your files.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('upload');
      setSelectedProvider(null);
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen]);

  const renderCloudProviders = () => {
    const providers = [
      { id: 'google-drive', name: 'Google Drive', icon: '/icons/google-drive.svg' },
      { id: 'onedrive', name: 'OneDrive', icon: '/icons/onedrive.svg' },
      { id: 'dropbox', name: 'Dropbox', icon: '/icons/dropbox.svg' },
      { id: 'sharepoint', name: 'SharePoint', icon: '/icons/sharepoint.svg' }
    ] as const;

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id} 
            className={`p-4 flex flex-col items-center gap-2 cursor-pointer border-2 hover:border-primary hover:bg-primary/5 transition-colors duration-200`}
            onClick={() => handleProviderSelect(provider.id)}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={provider.icon} 
                alt={provider.name} 
                className="max-w-full max-h-full"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '/icons/cloud-fallback.svg';
                }}
              />
            </div>
            <span className="font-medium">{provider.name}</span>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-lg ${isMobile ? 'w-[95vw] p-4' : ''}`}>
        <DialogHeader>
          <DialogTitle>Add Files</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'cloud')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span>Connect Cloud</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-4">
            {!isUploading ? (
              <>
                <div 
                  {...getRootProps({
                    className: `border-2 border-dashed rounded-md p-6 text-center cursor-pointer
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'}`
                  })}
                >
                  <input {...getInputProps()} ref={fileInputRef} />
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2">
                    {isDragActive 
                      ? 'Drop files here...' 
                      : 'Drag and drop files here, or click to browse files'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 50MB
                  </p>
                </div>
                
                {isMobile && (
                  <div className="mt-4">
                    <Button 
                      variant="secondary" 
                      onClick={handleCaptureClick}
                      className="w-full"
                      disabled={isCapturing}
                    >
                      {isCapturing 
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                        : 'Capture with Camera'}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCaptureChange}
                      ref={captureInputRef}
                      className="hidden"
                    />
                  </div>
                )}
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h3>
                    <div className="max-h-[180px] overflow-y-auto rounded-md border">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 text-sm border-b last:border-0">
                          <div className="flex items-center overflow-hidden">
                            <FileText className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatFileSize(file.size)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                  <p className="mt-2">Uploading files...</p>
                  <p className="text-muted-foreground text-sm">{Math.round(uploadProgress)}%</p>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cloud" className="mt-4">
            {selectedProvider ? (
              <CloudProviderBrowser
                provider={selectedProvider}
                onBack={handleBackToProviders}
                onSelect={(files) => {
                  // Handle cloud file selection
                  console.log('Selected cloud files:', files);
                }}
                storeFullContent={storeFullContent}
                suggestTags={suggestTags}
              />
            ) : (
              renderCloudProviders()
            )}
          </TabsContent>
        </Tabs>
        
        {/* Options Section */}
        {!isUploading && (
          <div className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="storeFullContent"
                checked={storeFullContent}
                onCheckedChange={(checked) => setStoreFullContent(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="storeFullContent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Store full content in vector DB
                </Label>
                <p className="text-xs text-muted-foreground">
                  Faster access but uses more storage
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="suggestTags"
                checked={suggestTags}
                onCheckedChange={(checked) => setSuggestTags(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="suggestTags"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Suggest tags using AI
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically identify relevant tags
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <DialogFooter className="mt-6">
          {!isUploading && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={
                  (activeTab === 'upload' && selectedFiles.length === 0) ||
                  (activeTab === 'cloud' && !selectedProvider)
                }
              >
                {activeTab === 'upload' ? 'Upload' : 'Connect'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
