import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Check, Plus, Tag, FolderOpen, X, Search, Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

interface FileTag {
  id: string;
  name: string;
  color?: string;
}

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tags' | 'categories';
  file: {
    id: string;
    name: string;
    tags: FileTag[];
    categories: FileTag[];
  };
  onSave: (fileId: string, items: FileTag[], type: 'tags' | 'categories') => Promise<void>;
}

export const TagsModal: React.FC<TagsModalProps> = ({
  isOpen,
  onClose,
  type = 'tags',
  file,
  onSave
}) => {
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { trackEvent } = useAnalytics();
  
  const [selectedItems, setSelectedItems] = useState<FileTag[]>([]);
  const [availableItems, setAvailableItems] = useState<FileTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('#60A5FA'); // Default blue color
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  
  // Set initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentItems = type === 'tags' ? file.tags : file.categories;
      setSelectedItems([...currentItems]);
      
      // Fetch available items
      fetchAvailableItems();
    }
  }, [isOpen, file, type]);

  // Mock API call to fetch available tags/categories
  const fetchAvailableItems = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockedItems: FileTag[] = [];
      
      if (type === 'tags') {
        mockedItems.push(
          { id: 't1', name: 'Finance', color: '#34D399' },
          { id: 't2', name: 'Report', color: '#60A5FA' },
          { id: 't3', name: 'Annual', color: '#F87171' },
          { id: 't4', name: 'Confidential', color: '#FBBF24' },
          { id: 't5', name: 'Draft', color: '#A78BFA' },
          { id: 't6', name: 'Final', color: '#EC4899' },
          { id: 't7', name: 'Internal', color: '#6EE7B7' },
          { id: 't8', name: 'External', color: '#93C5FD' },
          { id: 't9', name: 'Archived', color: '#9CA3AF' },
          { id: 't10', name: 'Active', color: '#10B981' }
        );
      } else {
        mockedItems.push(
          { id: 'c1', name: 'Financial', color: '#8B5CF6' },
          { id: 'c2', name: 'Corporate', color: '#FBBF24' },
          { id: 'c3', name: 'HR', color: '#EC4899' },
          { id: 'c4', name: 'Legal', color: '#F87171' },
          { id: 'c5', name: 'Marketing', color: '#34D399' },
          { id: 'c6', name: 'Operations', color: '#60A5FA' },
          { id: 'c7', name: 'IT', color: '#A78BFA' }
        );
      }
      
      setAvailableItems(mockedItems);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast({
        title: `Error loading ${type}`,
        description: `Could not load available ${type}.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available items based on search query
  const filteredItems = availableItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle item selection
  const toggleItemSelection = (item: FileTag) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
    
    trackEvent(`${type}_selection_changed`, { action: 'toggle', itemName: item.name });
  };

  // Create new item
  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: `Invalid ${type.slice(0, -1)} name`,
        description: `Please enter a valid ${type.slice(0, -1)} name.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Check for duplicates
    if (availableItems.some(item => item.name.toLowerCase() === newItemName.toLowerCase())) {
      toast({
        title: `Duplicate ${type.slice(0, -1)}`,
        description: `A ${type.slice(0, -1)} with this name already exists.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Create new item with temporary ID
    const newItem: FileTag = {
      id: `new-${Date.now()}`,
      name: newItemName.trim(),
      color: newItemColor,
    };
    
    setAvailableItems(prev => [...prev, newItem]);
    setSelectedItems(prev => [...prev, newItem]);
    setNewItemName('');
    
    toast({
      title: `${type.slice(0, -1)} created`,
      description: `${newItem.name} has been created and selected.`,
    });
    
    trackEvent(`${type}_created`, { itemName: newItem.name });
  };

  // Generate random color
  const generateRandomColor = () => {
    const colors = [
      '#F87171', // Red
      '#FBBF24', // Yellow
      '#34D399', // Green
      '#60A5FA', // Blue
      '#A78BFA', // Purple
      '#EC4899', // Pink
      '#6EE7B7', // Teal
      '#93C5FD', // Light Blue
      '#9CA3AF', // Gray
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setNewItemColor(randomColor);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave(file.id, selectedItems, type);
      
      toast({
        title: `${type} updated`,
        description: `The file's ${type} have been updated successfully.`,
      });
      
      trackEvent(`${type}_updated`, { 
        fileId: file.id, 
        count: selectedItems.length 
      });
      
      onClose();
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      toast({
        title: `Error updating ${type}`,
        description: `Could not update the file's ${type}.`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get title and icon based on type
  const getTitle = () => {
    return type === 'tags' ? (
      <span className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Manage Tags
      </span>
    ) : (
      <span className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4" />
        Manage Categories
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? 'w-[95vw] p-4 sm:max-w-lg' : 'sm:max-w-lg'}>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        {isMobile ? (
          <Tabs defaultValue="existing" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing {type}</TabsTrigger>
              <TabsTrigger value="new">Add New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="existing" className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type}...`}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[250px] rounded-md border p-2">
                  {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mb-2" />
                      <p>No {type} found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredItems.map(item => {
                        const isSelected = selectedItems.some(i => i.id === item.id);
                        
                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md cursor-pointer",
                              isSelected ? "bg-primary/10" : "hover:bg-muted"
                            )}
                            onClick={() => toggleItemSelection(item)}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              )}
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected {type}</h4>
                <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
                  {selectedItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No {type} selected</p>
                  ) : (
                    selectedItems.map(item => (
                      <Badge 
                        key={item.id} 
                        variant="outline"
                        className="bg-primary/10 py-1.5"
                        style={{ borderColor: item.color }}
                      >
                        {item.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1 -mr-1 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItemSelection(item);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={`Enter new ${type.slice(0, -1)} name`}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      ref={inputRef}
                    />
                    <div 
                      className="w-8 h-8 rounded-md cursor-pointer flex-shrink-0 border"
                      style={{ backgroundColor: newItemColor }}
                      onClick={() => generateRandomColor()}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the color box to generate a random color
                  </p>
                </div>
                
                <Button 
                  className="w-full"
                  disabled={!newItemName.trim()}
                  onClick={handleCreateItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create {type.slice(0, -1)}
                </Button>
                
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Preview</h4>
                  <div className="p-4 border rounded-md flex justify-center">
                    {!newItemName.trim() ? (
                      <span className="text-sm text-muted-foreground">Enter a name to preview</span>
                    ) : (
                      <Badge 
                        variant="outline"
                        className="bg-primary/10 py-1.5"
                        style={{ borderColor: newItemColor }}
                      >
                        {newItemName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col space-y-4 mt-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Command className="rounded-lg border shadow-md">
                  <div className="flex items-center px-3 border-b">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput 
                      placeholder={`Search ${type}...`} 
                      className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                  </div>
                  <CommandList>
                    {isLoading ? (
                      <div className="py-6 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">Loading {type}...</p>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No {type} found</CommandEmpty>
                        <CommandGroup>
                          {filteredItems.map((item) => {
                            const isSelected = selectedItems.some(i => i.id === item.id);
                            
                            return (
                              <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={() => toggleItemSelection(item)}
                              >
                                <div 
                                  className="mr-2 h-3 w-3 rounded-full"
                                  style={{ backgroundColor: item.color }} 
                                ></div>
                                <span>{item.name}</span>
                                {isSelected && (
                                  <Check className="ml-auto h-4 w-4 text-primary" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </div>
              
              <div className="space-y-1 w-56">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`New ${type.slice(0, -1)} name`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="h-9"
                  />
                  <div 
                    className="w-8 h-8 rounded-md cursor-pointer flex-shrink-0 border"
                    style={{ backgroundColor: newItemColor }}
                    onClick={() => generateRandomColor()}
                    title="Click to generate random color"
                  />
                </div>
                <Button 
                  className="w-full h-9"
                  disabled={!newItemName.trim()}
                  onClick={handleCreateItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected {type}</h4>
              <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No {type} selected</p>
                ) : (
                  selectedItems.map(item => (
                    <Badge 
                      key={item.id} 
                      variant="outline"
                      className="bg-primary/10 py-1.5"
                      style={{ borderColor: item.color }}
                    >
                      {item.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 -mr-1 hover:bg-transparent"
                        onClick={() => toggleItemSelection(item)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ${type}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};