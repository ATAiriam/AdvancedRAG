import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, 
  Tag, 
  Trash, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileCode, 
  FilePdf, 
  FileArchive,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn, formatRelativeDate } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTagsModal } from '@/hooks/use-tags-modal';

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  lastModified: string;
  source: string;
  status: 'processing' | 'indexed' | 'error';
  errorMessage?: string;
  tags: { id: string; name: string; color?: string }[];
  categories: { id: string; name: string; color?: string }[];
}

interface FileGridProps {
  files: File[];
  selectedFileIds: string[];
  onSelect: (fileId: string) => void;
  onDeselect: (fileId: string) => void;
  onView: (fileId: string) => void;
  isOffline?: boolean;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFileIds,
  onSelect,
  onDeselect,
  onView,
  isOffline = false
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const { openTagsModal } = useTagsModal();

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="h-6 w-6" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="h-6 w-6" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-6 w-6" />;
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return <FileArchive className="h-6 w-6" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return <FileCode className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
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
            Indexed
          </Badge>
        );
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{files.find(f => f.status === 'error')?.errorMessage || 'An error occurred'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        const isSelected = selectedFileIds.includes(file.id);
        const fileExtension = file.name.split('.').pop() || '';
        
        return (
          <Card 
            key={file.id}
            className={cn(
              "transition-all duration-200 hover:shadow-md", 
              isSelected ? "ring-2 ring-primary ring-offset-2" : ""
            )}
          >
            <div className="p-4 pb-0 flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  {getFileIcon(fileExtension)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(file.uploadDate)}
                  </p>
                </div>
              </div>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelect(file.id);
                  } else {
                    onDeselect(file.id);
                  }
                }}
                aria-label={`Select ${file.name}`}
                className="mt-1"
              />
            </div>
            
            <CardContent className="p-4 pt-2">
              <div className="flex flex-wrap gap-1 mt-2">
                {getStatusBadge(file.status)}
                
                {file.tags.slice(0, isTablet ? 2 : 3).map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="outline"
                    className="bg-primary/10"
                    style={{ borderColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                
                {file.tags.length > (isTablet ? 2 : 3) && (
                  <Badge variant="outline" className="bg-muted">
                    +{file.tags.length - (isTablet ? 2 : 3)}
                  </Badge>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-3 pt-0 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(file.id)}
                disabled={isOffline && file.source !== 'upload'}
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openTagsModal(file)}
                disabled={isOffline}
                className="h-8 w-8"
              >
                <Tag className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // Delete functionality would be handled at the page level
                  onSelect(file.id);
                }}
                disabled={isOffline}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
