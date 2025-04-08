import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine multiple class names and merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Delay execution for a specified time
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncate a string to a maximum length and add an ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Convert a string to camelCase
 * @param str String to convert
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Deep clone an object
 * @param obj Object to clone
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Create a debounced version of a function
 * @param fn Function to debounce
 * @param wait Milliseconds to wait
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Create a throttled version of a function
 * @param fn Function to throttle
 * @param limit Milliseconds to limit
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get a random string ID
 * @param length Length of ID
 */
export function getRandomId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Safely access nested object properties
 * @param obj Object to access
 * @param path Path to property
 * @param fallback Fallback value
 */
export function getNestedValue<T, F>(
  obj: Record<string, any>,
  path: string,
  fallback: F
): T | F {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return fallback;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? fallback : result as T;
}

/**
 * Check if a value is an object
 * @param value Value to check
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if the app is running on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if the app is running on iOS
 */
export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Generate a color based on a string (useful for avatars)
 * @param str String to generate color from
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Get initials from a name
 * @param name Name to get initials from
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Convert a date to a relative time string (e.g. "5 minutes ago")
 * @param date Date to convert
 */
export function getRelativeTimeString(date: Date | string | number): string {
  const now = new Date();
  const dateObj = new Date(date);
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  // Future date
  if (seconds < 0) {
    const absSeconds = Math.abs(seconds);
    if (absSeconds < intervals.minute) {
      return 'in a few seconds';
    } else if (absSeconds < intervals.hour) {
      const minutes = Math.floor(absSeconds / intervals.minute);
      return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (absSeconds < intervals.day) {
      const hours = Math.floor(absSeconds / intervals.hour);
      return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (absSeconds < intervals.week) {
      const days = Math.floor(absSeconds / intervals.day);
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (absSeconds < intervals.month) {
      const weeks = Math.floor(absSeconds / intervals.week);
      return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (absSeconds < intervals.year) {
      const months = Math.floor(absSeconds / intervals.month);
      return `in ${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(absSeconds / intervals.year);
      return `in ${years} year${years > 1 ? 's' : ''}`;
    }
  }
  
  // Past date
  if (seconds < intervals.minute) {
    return 'just now';
  } else if (seconds < intervals.hour) {
    const minutes = Math.floor(seconds / intervals.minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds < intervals.day) {
    const hours = Math.floor(seconds / intervals.hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (seconds < intervals.week) {
    const days = Math.floor(seconds / intervals.day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (seconds < intervals.month) {
    const weeks = Math.floor(seconds / intervals.week);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (seconds < intervals.year) {
    const months = Math.floor(seconds / intervals.month);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(seconds / intervals.year);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Format a date to a string
 * @param date Date to format
 * @param format Format string
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const dateObj = new Date(date);
  
  const formats: Record<string, () => string | number> = {
    'YYYY': () => dateObj.getFullYear(),
    'YY': () => String(dateObj.getFullYear()).slice(-2),
    'MM': () => String(dateObj.getMonth() + 1).padStart(2, '0'),
    'M': () => dateObj.getMonth() + 1,
    'DD': () => String(dateObj.getDate()).padStart(2, '0'),
    'D': () => dateObj.getDate(),
    'HH': () => String(dateObj.getHours()).padStart(2, '0'),
    'H': () => dateObj.getHours(),
    'mm': () => String(dateObj.getMinutes()).padStart(2, '0'),
    'm': () => dateObj.getMinutes(),
    'ss': () => String(dateObj.getSeconds()).padStart(2, '0'),
    's': () => dateObj.getSeconds(),
  };
  
  // Replace format tokens with date values
  let result = format;
  for (const [token, func] of Object.entries(formats)) {
    result = result.replace(new RegExp(token, 'g'), String(func()));
  }
  
  return result;
}
