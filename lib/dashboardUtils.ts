import { format, subDays, subWeeks, subMonths, subYears, isValid } from 'date-fns';
import { TimeRange } from '@/redux/slices/dashboardSlice';

/**
 * Utility functions for dashboard data processing and formatting
 */

/**
 * Generate a date range based on the selected time range
 * @param timeRange The selected time range
 * @returns Array of dates
 */
export function getDateRangeForTimeRange(timeRange: TimeRange): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  
  switch (timeRange) {
    case 'day':
      // Past 24 hours, hourly intervals
      for (let i = 23; i >= 0; i--) {
        const date = new Date(today);
        date.setHours(today.getHours() - i);
        date.setMinutes(0, 0, 0);
        dates.push(date);
      }
      break;
    case 'week':
      // Past 7 days, daily intervals
      for (let i = 6; i >= 0; i--) {
        dates.push(subDays(today, i));
      }
      break;
    case 'month':
      // Past 30 days, daily intervals
      for (let i = 29; i >= 0; i--) {
        dates.push(subDays(today, i));
      }
      break;
    case 'year':
      // Past 12 months, monthly intervals
      for (let i = 11; i >= 0; i--) {
        dates.push(subMonths(today, i));
      }
      break;
    default:
      // Default to week
      for (let i = 6; i >= 0; i--) {
        dates.push(subDays(today, i));
      }
  }
  
  return dates;
}

/**
 * Format a date based on the selected time range
 * @param date The date to format
 * @param timeRange The selected time range
 * @returns Formatted date string
 */
export function formatDateForTimeRange(date: Date | string, timeRange: TimeRange): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  
  switch (timeRange) {
    case 'day':
      return format(dateObj, 'h:mm a');
    case 'week':
      return format(dateObj, 'EEE');
    case 'month':
      return format(dateObj, 'MMM d');
    case 'year':
      return format(dateObj, 'MMM');
    default:
      return format(dateObj, 'MMM d');
  }
}

/**
 * Get the start and end dates for a time range
 * @param timeRange The selected time range
 * @returns Object with start and end dates
 */
export function getTimeRangeDates(timeRange: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;
  
  switch (timeRange) {
    case 'day':
      start = subDays(end, 1);
      break;
    case 'week':
      start = subWeeks(end, 1);
      break;
    case 'month':
      start = subMonths(end, 1);
      break;
    case 'year':
      start = subYears(end, 1);
      break;
    default:
      start = subWeeks(end, 1);
  }
  
  return { start, end };
}

/**
 * Fill in missing data points for time series data
 * @param data Array of data points with date and value
 * @param timeRange The selected time range
 * @param valueKey The key for the value in the data objects
 * @param dateKey The key for the date in the data objects
 * @returns Array with filled data points
 */
export function fillMissingDataPoints<T extends Record<string, any>>(
  data: T[],
  timeRange: TimeRange,
  valueKey: keyof T,
  dateKey: keyof T
): T[] {
  if (!data || data.length === 0) return [];
  
  // Get the date range
  const dateRange = getDateRangeForTimeRange(timeRange);
  
  // Create a map of existing data points by date string
  const dataMap = new Map<string, T>();
  
  // Format to use for comparison
  const getDateFormat = (range: TimeRange) => {
    switch (range) {
      case 'day':
        return 'yyyy-MM-dd HH:00';
      case 'week':
      case 'month':
        return 'yyyy-MM-dd';
      case 'year':
        return 'yyyy-MM';
      default:
        return 'yyyy-MM-dd';
    }
  };
  
  const dateFormat = getDateFormat(timeRange);
  
  // Fill the map with existing data
  data.forEach(item => {
    const date = new Date(String(item[dateKey]));
    const dateString = format(date, dateFormat);
    dataMap.set(dateString, item);
  });
  
  // Create the complete dataset with missing points filled in
  const filledData = dateRange.map(date => {
    const dateString = format(date, dateFormat);
    
    if (dataMap.has(dateString)) {
      return dataMap.get(dateString) as T;
    }
    
    // Create a new data point with 0 value
    const newPoint: Record<string, any> = {
      ...data[0],
      [dateKey]: date.toISOString(),
      [valueKey]: 0
    };
    
    return newPoint as T;
  });
  
  return filledData;
}

/**
 * Calculate trend percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Object with trend value and direction
 */
export function calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
  }
  
  const percentChange = ((current - previous) / previous) * 100;
  
  return {
    value: Math.abs(Math.round(percentChange)),
    isPositive: percentChange >= 0
  };
}

/**
 * Generate dynamic color palette for charts based on theme
 * @param isDark Whether dark mode is enabled
 * @param count Number of colors needed
 * @returns Array of color strings
 */
export function generateChartColors(isDark: boolean, count: number): string[] {
  const baseColors = isDark 
    ? [
        '#60A5FA', // blue-400
        '#A78BFA', // purple-400
        '#F472B6', // pink-400
        '#34D399', // emerald-400
        '#FBBF24', // amber-400
        '#F87171', // red-400
        '#818CF8', // indigo-400
        '#2DD4BF', // teal-400
        '#FB923C', // orange-400
        '#A3E635'  // lime-400
      ]
    : [
        '#2563EB', // blue-600
        '#7C3AED', // purple-600
        '#DB2777', // pink-600
        '#059669', // emerald-600
        '#D97706', // amber-600
        '#DC2626', // red-600
        '#4F46E5', // indigo-600
        '#0D9488', // teal-600
        '#EA580C', // orange-600
        '#65A30D'  // lime-600
      ];
  
  // If we need more colors than we have base colors, cycle through them
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}