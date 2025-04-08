import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from './Button';

// Modal panel variants
const modalPanelVariants = cva(
  // Base styles
  "relative w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all",
  {
    variants: {
      size: {
        xs: "sm:max-w-xs",
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        "3xl": "sm:max-w-3xl",
        "4xl": "sm:max-w-4xl",
        "5xl": "sm:max-w-5xl",
        full: "sm:max-w-full",
      },
      position: {
        center: "sm:my-8 sm:mx-auto",
        top: "sm:mt-16 sm:mx-auto",
        bottom: "sm:mb-0 sm:mt-auto sm:mx-auto",
      },
      fullHeight: {
        true: "sm:h-[calc(100vh-8rem)] flex flex-col",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      position: "center",
      fullHeight: false,
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalPanelVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  contentClassName?: string;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  hideBackdrop?: boolean;
  hideOverflow?: boolean;
  noPadding?: boolean;
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  mobileFullScreen?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  showCloseButton = true,
  closeOnClickOutside = true,
  size,
  position,
  fullHeight,
  contentClassName,
  initialFocus,
  hideBackdrop = false,
  hideOverflow = false,
  noPadding = false,
  topContent,
  bottomContent,
  mobileFullScreen = true,
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnClickOutside ? onClose : () => {}}
        initialFocus={initialFocus}
      >
        {/* Modal backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={cn(
              "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
              hideBackdrop && "bg-opacity-0"
            )}
          />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className={cn(
              "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
              mobileFullScreen && "md:items-center md:p-0"
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={cn(
                  modalPanelVariants({ size, position, fullHeight }),
                  mobileFullScreen && "h-screen sm:h-auto max-h-screen sm:max-h-[90vh]",
                  !mobileFullScreen && "max-h-[90vh]",
                  hideOverflow && "overflow-hidden"
                )}
              >
                {/* Close button */}
                {showCloseButton && (
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={onClose}
                      aria-label="Close"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* Optional top content (appears above title) */}
                {topContent && topContent}

                {/* Title section (if title provided) */}
                {(title || description) && (
                  <div
                    className={cn(
                      "px-4 pb-4 pt-5 sm:p-6",
                      !description && "sm:pb-4"
                    )}
                  >
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Main content */}
                <div
                  className={cn(
                    "flex-1",
                    !noPadding && "px-4 py-5 sm:p-6",
                    hideOverflow ? "overflow-hidden" : "overflow-auto",
                    contentClassName
                  )}
                >
                  {children}
                </div>

                {/* Optional bottom content (buttons, etc) */}
                {bottomContent && (
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    {bottomContent}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Dialog footer with action buttons
export interface ModalFooterProps {
  primaryActionLabel?: string;
  primaryAction?: () => void;
  isPrimaryLoading?: boolean;
  isPrimaryDisabled?: boolean;
  primaryVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  secondaryActionLabel?: string;
  secondaryAction?: () => void;
  isSecondaryLoading?: boolean;
  isSecondaryDisabled?: boolean;
  
  cancelLabel?: string;
  onCancel?: () => void;
  hideCancelButton?: boolean;
  
  children?: ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  primaryActionLabel,
  primaryAction,
  isPrimaryLoading = false,
  isPrimaryDisabled = false,
  primaryVariant = "default",
  
  secondaryActionLabel,
  secondaryAction,
  isSecondaryLoading = false,
  isSecondaryDisabled = false,
  
  cancelLabel = "Cancel",
  onCancel,
  hideCancelButton = false,
  
  children,
  className,
}) => {
  if (children) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div className={cn("sm:flex sm:flex-row-reverse gap-2", className)}>
      {primaryActionLabel && primaryAction && (
        <Button
          variant={primaryVariant}
          onClick={primaryAction}
          isLoading={isPrimaryLoading}
          disabled={isPrimaryDisabled}
          className="w-full sm:w-auto"
        >
          {primaryActionLabel}
        </Button>
      )}
      
      {secondaryActionLabel && secondaryAction && (
        <Button
          variant="outline"
          onClick={secondaryAction}
          isLoading={isSecondaryLoading}
          disabled={isSecondaryDisabled}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          {secondaryActionLabel}
        </Button>
      )}
      
      {!hideCancelButton && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  );
};

export default Modal;
