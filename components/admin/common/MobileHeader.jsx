'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3Icon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const MobileHeader = ({ title, showBackButton = false, onMenuClick }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // If not on mobile, don't render the header
  if (!isMobile) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center">
      {showBackButton ? (
        <button 
          onClick={() => router.back()}
          className="p-1 -ml-1 mr-2 rounded-full text-gray-500 dark:text-gray-400"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      ) : onMenuClick && (
        <button 
          onClick={onMenuClick}
          className="p-1 -ml-1 mr-2 rounded-full text-gray-500 dark:text-gray-400"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      )}
      
      <h1 className="text-lg font-medium text-gray-900 dark:text-white truncate">
        {title}
      </h1>
    </div>
  );
};

export default MobileHeader;
