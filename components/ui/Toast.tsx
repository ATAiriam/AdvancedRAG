import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast data structure
export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Toast variants for styling
const toastVariants = cva(
  "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 transition-all",
  {
    variants: {
      type: {
        success: "bg-green-50 dark:bg-green-900/30 ring-green-500/30 dark:ring-green-500/20",
        error: "bg-red-50 dark:bg-red-900/30 ring-red-500/30 dark:ring-red-500/20",
        info: "bg-blue-50 dark:bg-blue-900/30 ring-blue-500/30 dark:ring-blue-500/20",
        warning: "bg-amber-50 dark:bg-amber-900/30 ring-amber-500/30 dark:ring-amber-500/20",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

// Default toast durations by type
const DEFAULT_DURATIONS = {
  success: 3000,
  error: 5000,
  info: 4000,
  warning: 4000,
};

// Toast icon components
const ToastIcon: React.FC<{ type: ToastType; className?: string }> = ({ type, className }) => {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
  };
  
  const colors = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400',
  };
  
  const Icon = icons[type];
  
  return <Icon className={cn('h-5 w-5', colors[type], className)} aria-hidden="true" />;
};

// Toast component
export interface ToastComponentProps extends Toast {}

export const ToastComponent: React.FC<ToastComponentProps> = ({
  id,
  title,
  message,
  type,
  duration,
  action,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  // Default duration based on type if not specified
  const actualDuration = duration || DEFAULT_DURATIONS[type];
  
  // Handle closing the toast
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Allow time for exit animation
  };
  
  // Auto-close after duration
  useEffect(() => {
    if (actualDuration === Infinity) return;
    
    const timer = setTimeout(() => {
      handleClose();
    }, actualDuration);
    
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (actualDuration / 100));
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [actualDuration]);
  
  return (
    <div 
      className={cn(
        "transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={toastVariants({ type })}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ToastIcon type={type} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {title && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </p>
              )}
              <p className={cn("text-sm text-gray-700 dark:text-gray-300", title && "mt-1")}>
                {message}
              </p>
              {action && (
                <div className="mt-3 flex gap-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      action.onClick();
                      handleClose();
                    }}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
                      {
                        "bg-green-600 hover:bg-green-700 focus:ring-green-500": type === 'success',
                        "bg-red-600 hover:bg-red-700 focus:ring-red-500": type === 'error',
                        "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500": type === 'info',
                        "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500": type === 'warning',
                      }
                    )}
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1 transition-all",
            {
              "bg-green-500": type === 'success',
              "bg-red-500": type === 'error',
              "bg-blue-500": type === 'info',
              "bg-amber-500": type === 'warning',
            }
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Toast context
interface ToastContextProps {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextProps>({
  toasts: [],
  addToast: () => '',
  removeToast: () => {},
  removeAllToasts: () => {},
});

// Toast provider component
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };
  
  // Add a new toast
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => {
      // Limit number of toasts
      const newToasts = [...prev, { ...toast, id }];
      if (newToasts.length > maxToasts) {
        return newToasts.slice(newToasts.length - maxToasts);
      }
      return newToasts;
    });
    return id;
  };
  
  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  // Remove all toasts
  const removeAllToasts = () => {
    setToasts([]);
  };
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
      {children}
      
      {/* Toast container */}
      <div
        className={cn(
          "fixed z-50 m-4 flex flex-col items-center gap-2 sm:gap-3 w-full sm:max-w-sm",
          positionClasses[position]
        )}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook to use toast functionality
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  // Helper methods for different toast types
  const success = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return context.addToast({ type: 'success', message, ...options });
  };
  
  const error = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return context.addToast({ type: 'error', message, ...options });
  };
  
  const info = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return context.addToast({ type: 'info', message, ...options });
  };
  
  const warning = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return context.addToast({ type: 'warning', message, ...options });
  };
  
  const custom = (toast: Omit<Toast, 'id'>) => {
    return context.addToast(toast);
  };
  
  return {
    ...context,
    success,
    error,
    info,
    warning,
    custom,
  };
};

export default ToastComponent;