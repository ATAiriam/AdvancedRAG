import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getInitials, stringToColor } from '@/lib/utils';

// Define avatar variants with different sizes and appearances
const avatarVariants = cva(
  "inline-flex items-center justify-center flex-shrink-0 font-medium text-white",
  {
    variants: {
      variant: {
        default: "bg-primary-500",
        secondary: "bg-secondary-500",
        success: "bg-green-500",
        destructive: "bg-red-500",
        warning: "bg-amber-500",
        slate: "bg-slate-500",
        gray: "bg-gray-400 dark:bg-gray-600",
        dynamic: "", // For dynamic colors based on name
      },
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
      border: {
        none: "",
        thin: "ring-1 ring-black/10 dark:ring-white/10",
        thick: "ring-2 ring-black/10 dark:ring-white/10",
      },
      status: {
        none: "",
        online: "after:absolute after:bottom-0 after:right-0 after:h-1/4 after:w-1/4 after:rounded-full after:bg-green-500 after:ring-1 after:ring-white after:ring-offset-0",
        offline: "after:absolute after:bottom-0 after:right-0 after:h-1/4 after:w-1/4 after:rounded-full after:bg-gray-400 after:ring-1 after:ring-white after:ring-offset-0",
        away: "after:absolute after:bottom-0 after:right-0 after:h-1/4 after:w-1/4 after:rounded-full after:bg-amber-500 after:ring-1 after:ring-white after:ring-offset-0",
        busy: "after:absolute after:bottom-0 after:right-0 after:h-1/4 after:w-1/4 after:rounded-full after:bg-red-500 after:ring-1 after:ring-white after:ring-offset-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "circle",
      border: "none",
      status: "none",
    },
    compoundVariants: [
      {
        status: ["online", "offline", "away", "busy"],
        className: "relative",
      },
    ],
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof avatarVariants>, "border"> {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: React.ReactNode;
  border?: VariantProps<typeof avatarVariants>["border"];
  status?: VariantProps<typeof avatarVariants>["status"];
  statusPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  variant?: VariantProps<typeof avatarVariants>["variant"];
}

/**
 * Avatar component for user profiles with various sizes, shapes, and statuses
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "",
      name,
      fallback,
      variant = "default",
      size = "md",
      shape = "circle",
      border = "none",
      status,
      statusPosition = "bottom-right",
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    // Handle image load error
    const handleError = () => {
      setImageError(true);
    };

    // Generate background color based on the name
    const style =
      variant === "dynamic" && name
        ? { backgroundColor: stringToColor(name) }
        : undefined;

    // Create status class based on status position
    const statusClass = status
      ? status === "none"
        ? ""
        : status === "online"
        ? `after:${statusPosition}`
        : status === "offline"
        ? `after:${statusPosition}`
        : status === "away"
        ? `after:${statusPosition}`
        : `after:${statusPosition}`
      : "";

    // Custom class for status position
    const customStatusClass = status && status !== "none" ? statusClass : "";

    // Combined classes
    const combinedClassNames = cn(
      avatarVariants({ variant, size, shape, border, status }),
      customStatusClass,
      className
    );

    return (
      <div
        className={combinedClassOverride(
          avatarVariants({ variant, size, shape, border, status }),
          customStatusClass,
          className
        )}
        ref={ref}
        style={style}
        {...props}
      >
        {!imageError && src ? (
          <img
            src={src}
            alt={alt}
            onError={handleError}
            className={cn(
              "h-full w-full object-cover",
              shape === "circle" ? "rounded-full" : "rounded-md"
            )}
          />
        ) : fallback ? (
          fallback
        ) : (
          <span className="flex h-full w-full items-center justify-center font-medium" aria-hidden="true">
            {name ? getInitials(name) : alt ? getInitials(alt) : "?"}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Helper function to correctly combine status classes
function combinedClassOverride(
  variants: string,
  statusClass: string,
  className?: string
): string {
  // Remove existing after: classes from variants
  const cleanedVariants = variants
    .split(" ")
    .filter((cls) => !cls.startsWith("after:"))
    .join(" ");

  return cn(cleanedVariants, statusClass, className);
}

// Group component for displaying multiple avatars in a stack
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: VariantProps<typeof avatarVariants>["size"];
  border?: VariantProps<typeof avatarVariants>["border"];
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, className, max, size = "md", border = "thin", ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const totalAvatars = childrenArray.length;
    const showMax = max !== undefined && max < totalAvatars;
    const maxAvatars = showMax ? Math.min(max, totalAvatars) : totalAvatars;
    const excessAvatars = showMax ? totalAvatars - maxAvatars : 0;

    // Calculate negative margin based on size
    const getMarginForSize = () => {
      switch (size) {
        case "xs":
          return "-mr-1.5";
        case "sm":
          return "-mr-2";
        case "md":
          return "-mr-2.5";
        case "lg":
          return "-mr-3";
        case "xl":
          return "-mr-4";
        case "2xl":
          return "-mr-5";
        default:
          return "-mr-2.5";
      }
    };

    const margin = getMarginClass();

    function getMarginClass() {
      switch (size) {
        case "xs":
          return "-mr-1.5";
        case "sm":
          return "-mr-2";
        case "md":
          return "-mr-2.5";
        case "lg":
          return "-mr-3";
        case "xl":
          return "-mr-4";
        case "2xl":
          return "-mr-5";
        default:
          return "-mr-2.5";
      }
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-row-reverse justify-end", className)}
        {...props}
      >
        {/* Excess count indicator */}
        {showMax && excessAvatars > 0 && (
          <div
            className={cn(
              "relative flex items-center justify-center",
              avatarVariants({
                size,
                shape: "circle",
                variant: "gray",
                border,
              }),
              margin
            )}
          >
            <span className="text-xs font-medium">+{excessAvatars}</span>
          </div>
        )}

        {/* Displayed avatars */}
        {childrenArray.slice(0, maxAvatars).map((child, index) => {
          return (
            <div
              key={index}
              className={cn(
                index !== childrenArray.length - 1 && margin,
                "relative flex-shrink-0"
              )}
            >
              {React.isValidElement(child) && border
                ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                    size: size || (child as React.ReactElement<AvatarProps>).props.size,
                    border:
                      (child as React.ReactElement<AvatarProps>).props
                        .border || border,
                  })
                : child}
            </div>
          );
        })}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
