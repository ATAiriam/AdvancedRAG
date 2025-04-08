import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, 
  Tag, 
  Trash,
  MoreVertical,
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileCode, 
  FilePdf, 
  FileArchive,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { formatFileSize, formatRelativeDate } from '@/lib/utils';
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

interface FileListProps {
  files: File[];
  selectedFileIds: string[];
  onSelect: (fileId: string) => void;
  onDeselect: (fileId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onView: (fileId: string) => void;
  isOffline?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFileIds,
  onSelect,
  onDeselect,
  onSelectAll,
  onDeselectAll,
  onView,
  isOffline = false
}) => {
  const isTableMode = useMediaQuery('(min-width: 768px)');
  const { openTagsModal } = useTagsModal();
  
  const [sortField, setSortField] = useState<keyof File>('uploadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="h-4 w-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="h-4 w-4" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return <FileArchive className="h-4 w-4" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return <FileCode className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const handleSort = (field: keyof File) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  // Sort files based on current sort field and direction
  const sortedFiles = [...files].sort((a, b) => {
    if (sortField === 'name' || sortField === 'type') {
      return sortDirection === 'asc'
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    } else if (sortField === 'uploadDate' || sortField === 'lastModified') {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'size') {
      return sortDirection === 'asc' ? a.size - b.size : b.size - a.size;
    }
    return 0;
  }

  // Render a table for desktop view
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={
                  selectedFileIds.length > 0 &&
                  selectedFileIds.length === files.length
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll();
                  } else {
                    onDeselectAll();
                  }
                }}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
              <div className="flex items-center">
                Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
              <div className="flex items-center">
                Type
                {getSortIcon('type')}
              </div>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('uploadDate')}>
              <div className="flex items-center">
                Date
                {getSortIcon('uploadDate')}
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFiles.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);
            const fileExtension = file.name.split('.').pop() || '';
            
            return (
              <TableRow 
                key={file.id}
                className={isSelected ? 'bg-primary/5' : ''}
                data-state={isSelected ? 'selected' : undefined}
              >
                <TableCell>
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
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getFileIcon(fileExtension)}
                    <span className="truncate max-w-[200px]" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{fileExtension.toUpperCase()}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        className="bg-primary/10"
                        style={{ borderColor: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <Badge variant="outline" className="bg-muted">
                        +{file.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {formatRelativeDate(file.uploadDate)}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Uploaded: {new Date(file.uploadDate).toLocaleString()}</p>
                        {file.lastModified && (
                          <p>Modified: {new Date(file.lastModified).toLocaleString()}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{getStatusBadge(file.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
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
                      onClick={() => onSelect(file.id)}
                      disabled={isOffline}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );;

  // Get sort icon for column headers
  const getSortIcon = (field: keyof File) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  // Render a card list for mobile view
  if (!isTableMode) {
    return (
      <div className="space-y-3">
        {sortedFiles.map((file) => {
          const isSelected = selectedFileIds.includes(file.id);
          const fileExtension = file.name.split('.').pop() || '';
          
          return (
            <div 
              key={file.id}
              className={`border rounded-md p-3 ${isSelected ? 'border-primary bg-primary/5' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2 flex-1 min-w-0">
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
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {getFileIcon(fileExtension)}
                      <h3 className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getStatusBadge(file.status)}
                      
                      {file.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag.id} 
                          variant="outline"
                          className="bg-primary/10 text-xs"
                          style={{ borderColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      
                      {file.tags.length > 2 && (
                        <Badge variant="outline" className="bg-muted text-xs">
                          +{file.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatRelativeDate(file.uploadDate)}</span>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onView(file.id)}
                      disabled={isOffline && file.source !== 'upload'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openTagsModal(file)}
                      disabled={isOffline}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Manage Tags
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onSelect(file.id)}
                      disabled={isOffline}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    );
  }