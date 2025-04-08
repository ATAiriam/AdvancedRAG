import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  count: number;
  fileName?: string;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  count,
  fileName,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash className="h-5 w-5 text-destructive" />
            <span>
              {count === 1
                ? fileName
                  ? `Delete "${fileName}"`
                  : 'Delete file'
                : `Delete ${count} files`}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {count === 1
              ? 'This file will be permanently deleted. This action cannot be undone.'
              : `These ${count} files will be permanently deleted. This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
