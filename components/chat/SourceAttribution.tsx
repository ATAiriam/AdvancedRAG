'use client';

import React, { useState } from 'react';
import { MessageSource } from '@/types/chat';
import { DocumentTextIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface SourceAttributionProps {
  sources: MessageSource[];
}

const SourceAttribution: React.FC<SourceAttributionProps> = ({ sources }) => {
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  
  const toggleSource = (sourceId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };
  
  return (
    <div className="space-y-2">
      {sources.map((source, index) => {
        const sourceKey = `${source.fileId}-${index}`;
        const isExpanded = expandedSources[sourceKey];
        
        return (
          <div 
            key={sourceKey}
            className="bg-white dark:bg-gray-700 rounded-md overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600"
          >
            <div 
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={() => toggleSource(sourceKey)}
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <DocumentTextIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={source.fileName}>
                    {source.fileName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {source.page !== undefined ? `Page ${source.page}` : 'Source'}
                  </p>
                </div>
              </div>
              
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              )}
            </div>
            
            {isExpanded && (
              <div className="p-2 text-xs text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 max-h-32 overflow-y-auto">
                <blockquote className="border-l-2 border-blue-500 pl-2 italic">
                  {source.snippet || "No preview available"}
                </blockquote>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SourceAttribution;
