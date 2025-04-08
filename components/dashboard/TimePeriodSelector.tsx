'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { TimeRange, setTimeRange } from '@/redux/slices/dashboardSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import analytics from '@/lib/analytics';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Labels for each time range
const timeRangeLabels: Record<TimeRange, string> = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
};

/**
 * Time period selector component optimized for mobile and touch
 */
export default function TimePeriodSelector() {
  const dispatch = useAppDispatch();
  const currentTimeRange = useAppSelector((state) => state.dashboard.timeRange);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('time-period-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle selection
  const handleSelectTimeRange = (range: TimeRange) => {
    // Track selection in analytics
    analytics.trackEvent('change_time_range', 'dashboard', { 
      from: currentTimeRange, 
      to: range 
    });
    
    // Update Redux state
    dispatch(setTimeRange(range));
    
    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div id="time-period-dropdown" className="relative inline-block text-left">
      {/* Mobile-friendly dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-target-min"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="h-5 w-5 mr-1 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <span>{timeRangeLabels[currentTimeRange]}</span>
        <ChevronDownIcon className={`ml-2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleSelectTimeRange(range)}
                className={`block w-full text-left px-4 py-3 text-sm ${
                  range === currentTimeRange
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                } touch-target-min`}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
