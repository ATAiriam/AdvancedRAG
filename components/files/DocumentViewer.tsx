import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

interface File {
  id: string;
  name: string;
  type: string;
  thumbnailUrl?: string;
  source: string;
  status: 'processing' | 'indexed' | 'error';
}

interface DocumentViewerProps {
  file: File;
  isLoading: boolean;
  isOffline: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  isLoading,
  isOffline
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { trackEvent } = useAnalytics();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset state when file changes
  useEffect(() => {
    setCurrentPage(1);
    setZoomLevel(100);
    setRotation(0);
    setContentLoading(true);
    setError(null);
    
    // Mock loading document
    const loadDocument = async () => {
      try {
        // Simulate API call to load document
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Set total pages based on file type
        const mockTotalPages = file.type === 'pdf' ? Math.floor(Math.random() * 20) + 1 : 1;
        setTotalPages(mockTotalPages);
        
        setContentLoading(false);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document preview.');
        setContentLoading(false);
      }
    };
    
    if (isOffline && file.source !== 'upload') {
      setError('Document preview not available offline.');
      setContentLoading(false);
    } else if (file.status === 'processing') {
      setError('Document is still being processed.');
      setContentLoading(false);
    } else if (file.status === 'error') {
      setError('Document processing failed.');
      setContentLoading(false);
    } else {
      loadDocument();
    }
  }, [file, isOffline]);

  // Navigation handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      trackEvent('document_viewer_page_changed', { direction: 'prev', fileId: file.id });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      trackEvent('document_viewer_page_changed', { direction: 'next', fileId: file.id });
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => prev + 25);
      trackEvent('document_viewer_zoom_changed', { action: 'in', level: zoomLevel + 25 });
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(prev => prev - 25);
      trackEvent('document_viewer_zoom_changed', { action: 'out', level: zoomLevel - 25 });
    }
  };

  // Rotation handler
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    trackEvent('document_viewer_rotated', { rotation: (rotation + 90) % 360 });
  };

  const renderContent = () => {
    if (isLoading || contentLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading document preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            {renderFileIcon()}
          </div>
          <h3 className="text-lg font-medium mb-2">{file.name}</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            variant="outline"
            disabled={isOffline && file.source !== 'upload'}
            onClick={() => {
              trackEvent('document_download_clicked', { fileId: file.id });
              // Download functionality would be implemented here
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Original
          </Button>
        </div>
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Image viewer for image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={file.thumbnailUrl || `/api/placeholder/800/600?text=${encodeURIComponent(file.name)}`}
            alt={file.name}
            className={cn(
              "max-h-full max-w-full object-contain transition-transform duration-300",
              `scale-${zoomLevel / 100}`
            )}
            style={{ transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})` }}
            onError={(e) => {
              // Fallback if image fails to load
              setError('Failed to load image preview.');
            }}
          />
        </div>
      );
    }
    
    // PDF or document preview (mocked)
    return (
      <div className="flex items-center justify-center h-full">
        <div 
          className="w-full max-w-2xl bg-white border shadow-sm p-8 mx-auto"
          style={{ transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})` }}
        >
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-20 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          </div>
          
          <div className="flex justify-center mt-6">
            <div className="text-sm text-muted-foreground border rounded-md px-2 py-1">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFileIcon = () => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (fileExtension) {
      case 'pdf':
        return <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.79 7.5h-1.79v-4c0-0.276-0.224-0.5-0.5-0.5h-14c-0.276 0-0.5 0.224-0.5 0.5v17c0 0.276 0.224 0.5 0.5 0.5h14c0.276 0 0.5-0.224 0.5-0.5v-4h1.79c0.276 0 0.5-0.224 0.5-0.5v-8c0-0.276-0.224-0.5-0.5-0.5zM16.25 19h-13v-16h13v16zM21.29 16h-1.79v-8h1.79v8zM10.582 14.671c-0.043-0.037-0.086-0.077-0.129-0.121-0.363-0.373-0.52-0.917-0.452-1.356 0.059-0.388 0.234-0.635 0.436-0.77 0.228-0.153 0.592-0.178 0.948-0.066 0.469 0.147 0.915 0.478 1.327 0.851 0.412-0.373 0.858-0.704 1.328-0.851 0.354-0.111 0.719-0.086 0.948 0.066 0.202 0.135 0.375 0.383 0.435 0.77 0.068 0.44-0.088 0.984-0.452 1.356-0.044 0.045-0.087 0.084-0.13 0.121 0.25 0.173 0.538 0.303 0.814 0.38-0.154 0.492-0.452 0.886-0.949 0.886-0.358 0-0.677-0.199-0.946-0.411-0.269 0.212-0.588 0.411-0.946 0.411-0.496 0-0.795-0.394-0.949-0.886 0.276-0.077 0.564-0.207 0.814-0.38h-0.001zM8.649 9.064c0.224 0.139 0.45 0.345 0.668 0.636 0.116 0.155 0.234 0.335 0.342 0.52 0.042-0.171 0.086-0.338 0.134-0.5 0.146-0.498 0.328-0.931 0.614-1.233 0.242-0.254 0.524-0.388 0.782-0.388 0.419 0 0.752 0.388 0.964 0.748 0.3 0.511 0.452 1.142 0.454 1.789 0.001 0.193-0.011 0.378-0.032 0.553 0.321-0.196 0.638-0.356 0.944-0.496 0.423-0.189 0.831-0.348 1.168-0.466 0.342-0.121 0.631-0.202 0.868-0.229-0.039-0.482-0.182-1.070-0.524-1.639-0.252-0.42-0.572-0.753-0.946-0.943-0.374-0.19-0.804-0.242-1.223-0.142-0.582 0.142-1.052 0.583-1.452 1.041-0.401-0.458-0.869-0.898-1.452-1.041-0.419-0.1-0.848-0.047-1.223 0.142-0.374 0.189-0.694 0.524-0.945 0.943-0.342 0.569-0.486 1.156-0.525 1.638 0.238 0.027 0.525 0.108 0.868 0.229 0.166 0.058 0.336 0.121 0.51 0.188zM9.893 12.693c-0.023-0.105-0.045-0.215-0.068-0.328-0.058-0.287-0.104-0.554-0.133-0.8-0.125 0.293-0.269 0.553-0.434 0.701-0.054 0.049-0.106 0.083-0.157 0.105 0.171 0.087 0.333 0.189 0.497 0.306 0.101 0.008 0.198 0.014 0.295 0.015v0.001zM12.736 11.564c0.027-0.176 0.041-0.363 0.040-0.559-0.001-0.488-0.117-0.969-0.33-1.332-0.119-0.203-0.228-0.308-0.259-0.332-0.164 0.33-0.299 0.878-0.344 1.413-0.033 0.399-0.006 0.715 0.082 0.914 0.074 0.168 0.16 0.258 0.365 0.278 0.102 0.010 0.213 0.009 0.326 0-0.001-0.127 0.006-0.255 0.021-0.383h-0.001zM14.691,12.576c-0.276,0.104-0.581,0.223-0.907,0.353c0.097-0.001,0.193-0.007,0.294-0.015,0.164-0.117,0.326-0.219,0.497-0.306-0.051-0.022-0.103-0.056-0.157-0.105-0.093-0.084-0.178-0.194-0.255-0.328,0.175,0.124,0.356,0.253,0.527,0.401z"/></svg>;
      case 'doc':
      case 'docx':
        return <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.5,9v7.5c0,0.276-0.224,0.5-0.5,0.5h-18c-0.276,0-0.5-0.224-0.5-0.5v-15c0-0.276,0.224-0.5,0.5-0.5h10.5v7.5c0,0.276,0.224,0.5,0.5,0.5H21.5z M14.5,1.5L21,8h-6.5V1.5z M9.736,11.884h-1.161l-1.9,5.198h1.05l0.408-1.23h1.996l0.408,1.23h1.05L9.736,11.884z M9.826,15.037H8.433l0.695-2.069L9.826,15.037z M14.192,15.932c-0.257,0-0.516-0.036-0.777-0.11s-0.489-0.179-0.681-0.317l0.278-0.745c0.168,0.125,0.362,0.223,0.583,0.295c0.221,0.072,0.439,0.108,0.654,0.108c0.224,0,0.398-0.035,0.521-0.105c0.123-0.07,0.184-0.167,0.184-0.291c0-0.086-0.031-0.156-0.094-0.211c-0.063-0.055-0.145-0.099-0.247-0.132c-0.102-0.033-0.233-0.069-0.393-0.105c-0.256-0.06-0.467-0.122-0.634-0.188c-0.166-0.065-0.309-0.169-0.429-0.312c-0.12-0.142-0.18-0.332-0.18-0.571c0-0.207,0.058-0.394,0.175-0.56c0.117-0.166,0.295-0.298,0.533-0.397c0.239-0.098,0.528-0.148,0.868-0.148c0.192,0,0.384,0.02,0.574,0.06c0.191,0.04,0.364,0.098,0.522,0.174c0.158,0.076,0.288,0.168,0.388,0.277l-0.268,0.744c-0.15-0.125-0.324-0.219-0.522-0.282c-0.198-0.064-0.38-0.095-0.547-0.095c-0.219,0-0.387,0.035-0.504,0.104c-0.117,0.07-0.175,0.166-0.175,0.288c0,0.086,0.031,0.156,0.093,0.21c0.062,0.055,0.145,0.099,0.247,0.132c0.102,0.034,0.234,0.069,0.394,0.106c0.264,0.063,0.479,0.128,0.643,0.193c0.164,0.065,0.307,0.167,0.428,0.306c0.121,0.139,0.182,0.325,0.182,0.557c0,0.205-0.059,0.389-0.179,0.554c-0.119,0.166-0.298,0.296-0.536,0.392C14.826,15.884,14.534,15.932,14.192,15.932z M16.935,11.884v5.198h0.994v-2.043h1.842v2.043h0.994v-5.198h-0.994v2.244h-1.842v-2.244H16.935z"/></svg>;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.5,9v7.5c0,0.276-0.224,0.5-0.5,0.5h-18c-0.276,0-0.5-0.224-0.5-0.5v-15c0-0.276,0.224-0.5,0.5-0.5h10.5v7.5c0,0.276,0.224,0.5,0.5,0.5H21.5z M14.5,1.5L21,8h-6.5V1.5z M9.525,12.884L8.374,14.55l-1.175-1.666H6.001l1.67,2.248l-1.734,2.25h1.198l1.239-1.744l1.239,1.744h1.197l-1.733-2.25l1.649-2.248H9.525z M14.749,16.538c-0.353,0-0.676-0.072-0.97-0.214c-0.294-0.143-0.528-0.351-0.704-0.623c-0.175-0.272-0.263-0.596-0.263-0.972c0-0.376,0.088-0.7,0.263-0.972c0.176-0.272,0.41-0.48,0.704-0.623c0.294-0.143,0.617-0.214,0.97-0.214c0.353,0,0.676,0.072,0.97,0.214c0.294,0.143,0.528,0.351,0.704,0.623c0.175,0.272,0.263,0.596,0.263,0.972c0,0.376-0.088,0.7-0.263,0.972c-0.176,0.272-0.41,0.48-0.704,0.623C15.425,16.466,15.102,16.538,14.749,16.538z M14.749,15.646c0.247,0,0.444-0.08,0.591-0.24c0.147-0.16,0.221-0.378,0.221-0.654s-0.073-0.494-0.221-0.654c-0.147-0.16-0.344-0.24-0.591-0.24s-0.444,0.08-0.591,0.24c-0.147,0.16-0.221,0.378-0.221,0.654s0.073,0.494,0.221,0.654C14.304,15.566,14.502,15.646,14.749,15.646z M18.122,16.538c-0.232,0-0.44-0.043-0.623-0.128c-0.183-0.086-0.337-0.208-0.461-0.367l0.299-0.33c0.096,0.116,0.206,0.203,0.33,0.262c0.124,0.059,0.252,0.089,0.383,0.089c0.171,0,0.306-0.038,0.404-0.113c0.098-0.076,0.147-0.174,0.147-0.295c0-0.1-0.034-0.18-0.102-0.24s-0.175-0.101-0.32-0.123l-0.299-0.045c-0.235-0.036-0.422-0.118-0.561-0.246c-0.139-0.127-0.209-0.298-0.209-0.512c0-0.168,0.044-0.319,0.131-0.451s0.213-0.237,0.377-0.311c0.164-0.074,0.353-0.111,0.567-0.111c0.192,0,0.369,0.033,0.528,0.099s0.295,0.164,0.406,0.292l-0.285,0.345c-0.089-0.095-0.184-0.164-0.283-0.207c-0.099-0.043-0.209-0.064-0.33-0.064c-0.155,0-0.28,0.037-0.376,0.111c-0.096,0.074-0.144,0.173-0.144,0.297c0,0.095,0.032,0.171,0.097,0.228c0.064,0.057,0.17,0.096,0.316,0.118l0.299,0.045c0.239,0.036,0.426,0.116,0.563,0.242c0.137,0.125,0.205,0.296,0.205,0.513c0,0.168-0.044,0.318-0.133,0.45s-0.214,0.236-0.377,0.311C18.53,16.5,18.34,16.538,18.122,16.538z"/></svg>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.5,9v7.5c0,0.276-0.224,0.5-0.5,0.5h-18c-0.276,0-0.5-0.224-0.5-0.5v-15c0-0.276,0.224-0.5,0.5-0.5h10.5v7.5c0,0.276,0.224,0.5,0.5,0.5H21.5z M14.5,1.5L21,8h-6.5V1.5z M8.5,11c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5s1.5-0.672,1.5-1.5S9.328,11,8.5,11z M7.059,14.948c-0.479,0-0.868,0.389-0.868,0.868v0.684h11.617v-2.303c0-0.479-0.389-0.868-0.868-0.868h-1.447l-1.028,0.683h-5.912l-1.028-0.683H7.059z"/></svg>;
      default:
        return <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.5,9v7.5c0,0.276-0.224,0.5-0.5,0.5h-18c-0.276,0-0.5-0.224-0.5-0.5v-15c0-0.276,0.224-0.5,0.5-0.5h10.5v7.5c0,0.276,0.224,0.5,0.5,0.5H21.5z M14.5,1.5L21,8h-6.5V1.5z"/></svg>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Document content */}
      <div className="flex-1 overflow-auto relative">
        {renderContent()}
      </div>
      
      {/* Controls */}
      {!isLoading && !contentLoading && !error && (
        <div className="flex items-center justify-between border-t p-2 bg-background/80 backdrop-blur-sm">
          {/* Pagination */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Zoom and rotate */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="h-8 w-8"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-xs w-10 text-center">{zoomLevel}%</span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};