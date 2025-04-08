import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileIcon, Plus } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface EmptyStateProps {
  onAddFiles: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddFiles }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <FileIcon className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">No files found</h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          Upload files to start analyzing your documents and use them for AI-powered conversations.
        </p>
        
        <Button onClick={onAddFiles} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>{isMobile ? 'Add Files' : 'Upload or Connect Files'}</span>
        </Button>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full max-w-2xl">
          <div className="border rounded-md p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium mb-1">Upload Files</h4>
            <p className="text-xs text-muted-foreground">Upload documents from your device</p>
          </div>
          
          <div className="border rounded-md p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium mb-1">Connect Cloud</h4>
            <p className="text-xs text-muted-foreground">Link to Google Drive, Dropbox & more</p>
          </div>
          
          <div className="border rounded-md p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium mb-1">Organize</h4>
            <p className="text-xs text-muted-foreground">Tag and categorize your documents</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
