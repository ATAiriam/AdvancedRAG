'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/hooks/useTheme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Component to toggle between light, dark, and system themes
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, effectiveTheme, isDarkMode, isReady } = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('theme-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Set theme icon based on current theme
  const ThemeIcon = () => {
    if (!isReady) return null;

    if (theme === 'system') {
      return <ComputerDesktopIcon className="h-5 w-5" />;
    }
    
    return isDarkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />;
  };

  const buttonClass = `rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`;

  return (
    <div id="theme-dropdown" className="relative">
      <button
        type="button"
        className={buttonClass}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle color theme"
      >
        <ThemeIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm",
                theme === 'light'
                  ? "bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <SunIcon className={cn(
                "h-5 w-5 mr-2",
                theme === 'light'
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              )} />
              <span>Light</span>
              {theme === 'light' && (
                <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 ml-auto"></span>
              )}
            </button>

            <button
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm",
                theme === 'dark'
                  ? "bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <MoonIcon className={cn(
                "h-5 w-5 mr-2",
                theme === 'dark'
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              )} />
              <span>Dark</span>
              {theme === 'dark' && (
                <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 ml-auto"></span>
              )}
            </button>

            <button
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm",
                theme === 'system'
                  ? "bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <ComputerDesktopIcon className={cn(
                "h-5 w-5 mr-2",
                theme === 'system'
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              )} />
              <span>System</span>
              {theme === 'system' && (
                <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 ml-auto"></span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
