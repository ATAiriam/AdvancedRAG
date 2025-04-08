import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-gray-950 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-500",
        ghost: "hover:bg-gray-100 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400 p-0 h-auto",
      }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine if we have an icon and its position
    const hasIcon = Boolean(leftIcon || rightIcon);
    const iconPosition = rightIcon && !leftIcon ? "right" : "left";

    // Handle the case where we want to render as a child
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            isLoading,
            isFullWidth,
            hasIcon,
            iconPosition,
            className,
          })
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };,
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-11 w-11",
        "mobile-full": "h-12 w-full px-4 text-base", // For mobile full width
      },
      isLoading: {
        true: "relative text-transparent transition-none hover:text-transparent",
      },
      isFullWidth: {
        true: "w-full",
      },
      hasIcon: {
        true: "",
      },
      iconPosition: {
        left: "flex-row",
        right: "flex-row-reverse",
      },
    },
    compoundVariants: [
      {
        // Add spacing between icon and text based on icon position
        hasIcon: true,
        iconPosition: "left",
        class: "space-x-2",
      },
      {
        hasIcon: true,
        iconPosition: "right",
        class: "space-x-reverse space-x-2",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      iconPosition: "left",
    },
  }