import React, { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Card container variants
const cardVariants = cva(
  // Base styles
  "rounded-lg border bg-white dark:bg-gray-950 shadow-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-gray-200 dark:border-gray-800",
        primary: "border-primary-200 dark:border-primary-800",
        secondary: "border-secondary-200 dark:border-secondary-800",
        destructive: "border-red-200 dark:border-red-800",
        success: "border-green-200 dark:border-green-800",
        warning: "border-amber-200 dark:border-amber-800",
        info: "border-blue-200 dark:border-blue-800",
      },
      isHoverable: {
        true: "transition-shadow hover:shadow-md",
      },
      isInteractive: {
        true: "cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900",
      },
      noPadding: {
        true: "p-0",
      },
      isFullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      isHoverable: false,
      isInteractive: false,
      noPadding: false,
      isFullWidth: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  isHoverable?: boolean;
  isInteractive?: boolean;
  noPadding?: boolean;
  isFullWidth?: boolean;
}

// Card component
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, isHoverable, isInteractive, noPadding, isFullWidth, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({
            variant,
            isHoverable,
            isInteractive,
            noPadding,
            isFullWidth,
            className,
          })
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card header variants
const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5 p-6",
  {
    variants: {
      noBorder: {
        false: "border-b border-gray-200 dark:border-gray-800",
        true: "",
      },
    },
    defaultVariants: {
      noBorder: false,
    },
  }
);

export interface CardHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {
  noBorder?: boolean;
}

// Card header component
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, noBorder, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardHeaderVariants({ noBorder, className })
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card title component
const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

// Card description component
const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

// Card content component
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

// Card footer component
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
