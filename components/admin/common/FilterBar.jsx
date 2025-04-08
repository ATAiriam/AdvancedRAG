'use client';

import { useState } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import AdminCard from './AdminCard';

const FilterBar = ({ filters, onFilterChange, options, isMobile = false }) => {
  const [expanded, setExpanded] = useState(isMobile ? false : true);
  
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };
  
  const handleClearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = 'all';
      return acc;
    }, {});
    
    onFilterChange(clearedFilters);
  };
  
  // Check if any filters are active (not 'all')
  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');
  
  // Mobile collapsed view
  if (isMobile && !expanded) {
    return (
      <AdminCard className="mb-6">
        <div className="p-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setExpanded(true)}
          >
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {hasActiveFilters ? 'Filters applied' : 'Filters'}
              </span>
            </div>
            <div className="flex items-center">
              {hasActiveFilters && (
                <span className="bg-primary text-white text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                  {Object.values(filters).filter(v => v !== 'all').length}
                </span>
              )}
              <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </AdminCard>
    );
  }
  
  return (
    <AdminCard className="mb-6">
      <div className="p-4">
        {/* Filter header with expand/collapse for mobile */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h3>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Filter content */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {Object.keys(options).map(filterKey => (
            <div key={filterKey} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {filterKey}
              </label>
              <select
                value={filters[filterKey] || 'all'}
                onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                className={`
                  block w-full rounded-md border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  shadow-sm focus:border-primary focus:ring-primary
                  ${isMobile ? 'text-base py-3' : 'text-sm'}
                `}
              >
                {options[filterKey].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        {/* Filter actions */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className={`
                text-sm text-gray-700 dark:text-gray-300
                hover:text-gray-900 dark:hover:text-gray-100
                ${isMobile ? 'px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md' : ''}
              `}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </AdminCard>
  );
};

export default FilterBar;
