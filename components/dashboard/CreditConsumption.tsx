'use client';

import { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loader';
import { useAppSelector } from '@/redux/store';
import { CreditConsumption } from '@/redux/slices/dashboardSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatDate } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formatDate(label, 'MMM D, YYYY')}
        </p>
        <p className="text-sm text-primary-600 dark:text-primary-400">
          <span className="font-medium">{payload[0].value.toLocaleString()}</span> credits
        </p>
      </div>
    );
  }

  return null;
};

/**
 * Credit consumption chart component
 * Visualizes credit usage over time with mobile optimization
 */
export default function CreditConsumptionChart() {
  const { data, loading, error } = useAppSelector(state => state.dashboard.creditConsumption);
  const timeRange = useAppSelector(state => state.dashboard.timeRange);
  const { isDarkMode } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  
  // State to store formatted data
  const [formattedData, setFormattedData] = useState<any[]>([]);
  const [average, setAverage] = useState<number>(0);
  
  // Format data for chart
  useEffect(() => {
    if (data && data.length > 0) {
      // Format dates and ensure data is sorted chronologically
      const formatted = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(item => ({
          ...item,
          // Format the date based on time range
          formattedDate: formatDateByTimeRange(item.date, timeRange)
        }));
        
      setFormattedData(formatted);
      
      // Calculate average
      const sum = formatted.reduce((acc, item) => acc + item.credits, 0);
      setAverage(sum / formatted.length);
    } else {
      setFormattedData([]);
      setAverage(0);
    }
  }, [data, timeRange]);
  
  // Helper to format date based on time range
  const formatDateByTimeRange = (dateString: string, range: string): string => {
    const date = new Date(dateString);
    switch(range) {
      case 'day':
        return formatDate(date, 'h:mm a');
      case 'week':
        return formatDate(date, 'EEE');
      case 'month':
        return formatDate(date, 'MMM d');
      case 'year':
        return formatDate(date, 'MMM');
      default:
        return formatDate(date, 'MMM d');
    }
  };
  
  // Mobile optimizations for chart
  const getChartHeight = () => {
    if (isMobile) return 200;
    if (isTablet) return 250;
    return 300;
  };
  
  const getTickCount = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };
  
  // Chart colors based on theme
  const lineColor = isDarkMode ? '#60A5FA' : '#2563EB';
  const referenceLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Credit Consumption</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
            <p className="text-red-500 dark:text-red-400 font-medium mb-2">Error loading data</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : formattedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No data available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Credit consumption data will appear here as you use the service.
            </p>
          </div>
        ) : (
          <div className="px-2 sm:px-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                <LineChart
                  data={formattedData}
                  margin={{
                    top: 20,
                    right: isMobile ? 5 : 20,
                    left: isMobile ? 0 : 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={!isMobile} />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                    tickLine={!isMobile}
                    axisLine={!isMobile}
                    interval={isMobile ? 'preserveStartEnd' : 0}
                    tickMargin={5}
                  />
                  <YAxis 
                    tickCount={getTickCount()} 
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                    width={isMobile ? 30 : 40}
                    tickLine={!isMobile}
                    axisLine={!isMobile}
                    tickFormatter={(value) => isMobile ? String(value) : value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {!isMobile && <Legend verticalAlign="top" height={36} />}
                  <ReferenceLine 
                    y={average} 
                    stroke={referenceLineColor} 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'Average', 
                      position: 'right',
                      fill: isDarkMode ? '#E5E7EB' : '#4B5563',
                      fontSize: 12
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="credits"
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={isMobile ? false : { r: 4, strokeWidth: 0, fill: lineColor }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: lineColor }}
                    name="Credits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
