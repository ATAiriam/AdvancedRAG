import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loaderVariants = cva(
  // Base styles
  "animate-spin",
  {
    variants: {
      variant: {
        primary: "text-primary-600 dark:text-primary-400",
        secondary: "text-secondary-600 dark:text-secondary-400",
        white: "text-white",
        gray: "text-gray-500 dark:text-gray-400",
      },
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface LoaderProps extends React.SVGAttributes<SVGSVGElement>, VariantProps<typeof loaderVariants> {
  label?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  className,
  variant,
  size,
  label,
  fullScreen = false,
  ...props
}) => {
  const loaderElement = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(loaderVariants({ variant, size }), className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" className="opacity-25" />
      <path
        className="opacity-75"
        d="M12 2a10 10 0 0 1 10 10"
      />
    </svg>
  );

  // For simple loader without label or fullscreen
  if (!label && !fullScreen) {
    return loaderElement;
  }

  // For loader with label or fullscreen
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 bg-white/80 dark:bg-gray-950/80 z-50"
      )}
      role="status"
    >
      {loaderElement}
      {label && (
        <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      {/* Screen reader text */}
      <span className="sr-only">Loading{label ? `: ${label}` : ""}</span>
    </div>
  );
};

// Alternative loader designs

// Dots Loader
export const DotsLoader: React.FC<Omit<LoaderProps, 'variant'> & { color?: string }> = ({
  size,
  className,
  label,
  fullScreen = false,
  color,
  ...props
}) => {
  const loaderElement = (
    <div className="flex space-x-1" aria-hidden="true" {...props}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full",
            color ? color : "bg-primary-600 dark:bg-primary-400",
            {
              "h-1 w-1": size === "xs",
              "h-2 w-2": size === "sm",
              "h-2.5 w-2.5": size === "md",
              "h-3 w-3": size === "lg",
              "h-4 w-4": size === "xl",
            },
            "animate-bounce",
            `animation-delay-${i * 100}`
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );

  // For simple loader without label or fullscreen
  if (!label && !fullScreen) {
    return loaderElement;
  }

  // For loader with label or fullscreen
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 bg-white/80 dark:bg-gray-950/80 z-50"
      )}
      role="status"
    >
      {loaderElement}
      {label && (
        <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <span className="sr-only">Loading{label ? `: ${label}` : ""}</span>
    </div>
  );
};

// Pulse Loader
export const PulseLoader: React.FC<Omit<LoaderProps, 'variant'>> = ({
  size,
  className,
  label,
  fullScreen = false,
  ...props
}) => {
  const loaderElement = (
    <div
      className={cn(
        "relative",
        {
          "h-6 w-6": size === "xs",
          "h-8 w-8": size === "sm",
          "h-12 w-12": size === "md",
          "h-16 w-16": size === "lg",
          "h-24 w-24": size === "xl",
        },
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
      <div className="absolute inset-0 rounded-full border-t-2 border-primary-600 dark:border-primary-400 animate-spin"></div>
    </div>
  );

  // For simple loader without label or fullscreen
  if (!label && !fullScreen) {
    return loaderElement;
  }

  // For loader with label or fullscreen
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 bg-white/80 dark:bg-gray-950/80 z-50"
      )}
      role="status"
    >
      {loaderElement}
      {label && (
        <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <span className="sr-only">Loading{label ? `: ${label}` : ""}</span>
    </div>
  );
};

// Skeleton Loader - Basic building block for skeleton screens
export const Skeleton: React.FC<{
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  animate?: boolean;
}> = ({
  className,
  width,
  height,
  rounded = 'md',
  animate = true,
}) => {
  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-800",
        animate && "animate-pulse",
        {
          "rounded-sm": rounded === "sm",
          "rounded-md": rounded === "md",
          "rounded-lg": rounded === "lg",
          "rounded-full": rounded === "full",
          "rounded-none": rounded === "none",
        },
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

export default Loader;
