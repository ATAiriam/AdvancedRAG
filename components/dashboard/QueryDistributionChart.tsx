'use client';

import { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loader';
import { useAppSelector } from '@/redux/store';
import { useTheme } from '@/hooks/useTheme';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Custom colors for bars
const COLORS = [
  '#3B82F6', // blue-500
  '#8B5CF6', // purple-500
  '#EC4899', // pink-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm">
          <span className="font-medium text-primary-600 dark:text-primary-400">
            {payload[0].value.toLocaleString()}
          </span>
          <span className="text-gray-500 dark:text-gray-400"> queries</span>
        </p>
      </div>
    );
  }

  return null;
};

/**
 * Query distribution chart component
 * Bar chart showing distribution of queries by category
 * Optimized for mobile with touch-friendly interactions
 */
export default function QueryDistributionChart() {
  const { data, loading, error } = useAppSelector(state => state.dashboard.queryDistribution);
  const timeRange = useAppSelector(state => state.dashboard.timeRange);
  const { isDarkMode } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  
  // State to store formatted data
  const [formattedData, setFormattedData] = useState<any[]>([]);
  
  // Process and sort data
  useEffect(() => {
    if (data && data.length > 0) {
      // Sort data by count in descending order
      const sortedData = [...data].sort((a, b) => b.count - a.count);
      
      // Limit to top 10 categories for cleaner display
      const topCategories = sortedData.slice(0, 10);
      
      setFormattedData(topCategories);
    } else {
      setFormattedData([]);
    }
  }, [data]);
  
  // Mobile optimizations for chart
  const getChartHeight = () => {
    if (isMobile) return 200;
    if (isTablet) return 250;
    return 300;
  };
  
  const getChartLayout = () => {
    return isMobile ? 'vertical' : 'horizontal';
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Query Distribution</CardTitle>
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
              Query distribution data will appear as you use the service.
            </p>
          </div>
        ) : (
          <div className="px-4 sm:px-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                {isMobile ? (
                  // Mobile: Horizontal bar chart (categories on Y-axis)
                  <BarChart
                    data={formattedData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 80, // More space for category names
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11 }} 
                      tickCount={5}
                    />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      tick={{ fontSize: 11 }} 
                      width={80}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      name="Queries" 
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {formattedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  // Desktop: Vertical bar chart (categories on X-axis)
                  <BarChart
                    data={formattedData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 50, // More space for rotated category names
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                      height={60}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar 
                      dataKey="count" 
                      name="Queries" 
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    >
                      {formattedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
