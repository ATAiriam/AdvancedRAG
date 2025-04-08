'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  DocumentIcon, 
  PhotoIcon, 
  TableCellsIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loader';
import { useAppSelector } from '@/redux/store';
import { TopDocument } from '@/redux/slices/dashboardSlice';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import analytics from '@/lib/analytics';

/**
 * Top Documents component for the dashboard
 * Shows most accessed documents with touch-friendly interactions
 * Responsive layout that switches between table and list view
 */
export default function TopDocuments() {
  const { data, loading, error } = useAppSelector(state => state.dashboard.topDocuments);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Get icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <TableCellsIcon className="h-6 w-6 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <PhotoIcon className="h-6 w-6 text-purple-500" />;
      case 'ppt':
      case 'pptx':
        return <ChartBarIcon className="h-6 w-6 text-orange-500" />;
      case 'txt':
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
      case 'json':
      case 'xml':
      case 'html':
      case 'js':
      case 'ts':
      case 'py':
      case 'java':
        return <CodeBracketIcon className="h-6 w-6 text-indigo-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Track document click
  const handleDocumentClick = (document: TopDocument) => {
    analytics.trackEvent('top_document_click', 'dashboard', {
      documentId: document.id,
      documentName: document.name,
      documentType: document.type
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-0 sm:pb-2">
        <CardTitle className="text-base sm:text-lg">Top Documents</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 sm:p-6 overflow-hidden">
        {loading ? (
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
                <Skeleton className="h-9 w-9 mr-3 rounded-md" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-4/5 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-red-500 dark:text-red-400 font-medium mb-2">Error loading data</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No documents yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload documents and interact with them to see your most frequently accessed files here.
            </p>
          </div>
        ) : isMobile ? (
          // Mobile: List view with touch-friendly rows
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((doc) => (
              <Link 
                key={doc.id}
                href={`/files/${doc.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center py-4 px-4">
                  <div className="mr-3 flex-shrink-0">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {doc.type.toUpperCase()} • {doc.accessCount} {doc.accessCount === 1 ? 'access' : 'accesses'}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Desktop: Table view
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Document
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Access Count
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {data.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onMouseEnter={() => setHoveredRow(doc.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {doc.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {doc.accessCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/files/${doc.id}`}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={() => handleDocumentClick(doc)}
                      >
                        <span className="sr-only">View document</span>
                        <ArrowTopRightOnSquareIcon 
                          className={`h-5 w-5 ${hoveredRow === doc.id ? 'opacity-100' : 'opacity-0'}`}
                        />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
