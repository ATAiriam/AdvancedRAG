'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { updateTenantTheme } from '@/redux/features/admin/tenantSlice';
import Image from 'next/image';
import AdminCard from '../common/AdminCard';
import MobileHeader from '../common/MobileHeader';
import { trackAdminAction } from '@/lib/admin/hooks/useActionTracking';

const ThemeCustomizer = ({ tenantId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { tenant, isLoading, error } = useSelector(state => state.tenants);
  
  // Theme state
  const [theme, setTheme] = useState({
    primaryColor: '#6366f1', // Default indigo
    logoUrl: '',
    favicon: '',
    darkMode: false
  });
  
  // UI state
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  const [uploadProgress, setUploadProgress] = useState({
    logo: null,
    favicon: null
  });
  
  // Predefined color options
  const colorOptions = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 640) {
        setPreviewMode('mobile');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize theme from tenant data
  useEffect(() => {
    if (tenant?.theme) {
      setTheme({
        primaryColor: tenant.theme.primaryColor || '#6366f1',
        logoUrl: tenant.theme.logoUrl || '',
        favicon: tenant.theme.favicon || '',
        darkMode: tenant.theme.darkMode || false
      });
    }
  }, [tenant]);
  
  // Handle color change
  const handleColorChange = (color) => {
    setTheme(prev => ({ ...prev, primaryColor: color }));
    trackAdminAction('change_theme_color', { tenantId, color });
  };
  
  // Handle theme toggle
  const handleDarkModeToggle = () => {
    setTheme(prev => ({ ...prev, darkMode: !prev.darkMode }));
    trackAdminAction('toggle_dark_mode', { tenantId, darkMode: !theme.darkMode });
  };
  
  // Handle file input change (for logo and favicon)
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Mock upload progress for demo
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = Math.min((prev[type] || 0) + 10, 100);
        return { ...prev, [type]: newProgress };
      });
    }, 200);
    
    // Simulate file upload and get URL
    setTimeout(() => {
      clearInterval(interval);
      
      // In a real implementation, this would be the URL returned from your file upload API
      const mockFileUrl = `https://example.com/uploads/${file.name}`;
      
      setTheme(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'favicon']: mockFileUrl
      }));
      
      setUploadProgress(prev => ({ ...prev, [type]: null }));
      trackAdminAction('upload_theme_asset', { tenantId, assetType: type });
    }, 2000);
  };
  
  // Handle file drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Mock upload progress and file handling
    // Similar to handleFileChange
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = Math.min((prev[type] || 0) + 10, 100);
        return { ...prev, [type]: newProgress };
      });
    }, 200);
    
    setTimeout(() => {
      clearInterval(interval);
      const mockFileUrl = `https://example.com/uploads/${file.name}`;
      
      setTheme(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'favicon']: mockFileUrl
      }));
      
      setUploadProgress(prev => ({ ...prev, [type]: null }));
      trackAdminAction('upload_theme_asset', { tenantId, assetType: type });
    }, 2000);
  };
  
  // Handle image removal
  const handleRemoveImage = (type) => {
    setTheme(prev => ({
      ...prev,
      [type === 'logo' ? 'logoUrl' : 'favicon']: ''
    }));
    trackAdminAction('remove_theme_asset', { tenantId, assetType: type });
  };
  
  // Handle save
  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      await dispatch(updateTenantTheme({ 
        tenantId, 
        theme 
      })).unwrap();
      
      setSaveStatus('success');
      trackAdminAction('save_tenant_theme', { tenantId });
      
      // Reset status after showing success
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save theme:', error);
      
      // Reset status after showing error
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  // Handle cancel/back
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <MobileHeader title="Theme Customization" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Theme Customization</h1>
          <p className="text-gray-500 dark:text-gray-400">Customize the appearance of your tenant</p>
        </div>
        
        {/* Save/Cancel buttons for desktop */}
        {!isMobile && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                        hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`
                px-4 py-2 rounded-lg text-white
                ${saveStatus === 'saving' ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary-dark'}
              `}
            >
              {saveStatus === 'saving' ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </div>
              ) : saveStatus === 'success' ? (
                <div className="flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Saved!
                </div>
              ) : saveStatus === 'error' ? (
                <div className="flex items-center">
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Failed
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Theme editor panel */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Color selection */}
          <AdminCard>
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Primary Color</h2>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    className={`
                      w-full aspect-square rounded-lg border-2 transition-all
                      ${theme.primaryColor === color.value 
                        ? 'border-gray-900 dark:border-white scale-110 shadow-md' 
                        : 'border-transparent hover:scale-105'}
                    `}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    title={color.name}
                    aria-label={`Select ${color.name} as primary color`}
                  >
                    {theme.primaryColor === color.value && (
                      <CheckIcon className="h-6 w-6 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Custom color input */}
              <div className="mt-4">
                <label htmlFor="customColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="customColor"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="h-10 w-10 border-0 rounded p-0 mr-2"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </AdminCard>
          
          {/* Logo upload */}
          <AdminCard>
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Logo</h2>
              {theme.logoUrl ? (
                <div className="relative mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                  <Image 
                    src={theme.logoUrl} 
                    alt="Tenant logo" 
                    width={200}
                    height={80}
                    className="max-h-20 object-contain"
                  />
                  <button
                    onClick={() => handleRemoveImage('logo')}
                    className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    aria-label="Remove logo"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div 
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center mb-4
                    ${isDragging 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-gray-300 dark:border-gray-700'}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'logo')}
                >
                  {uploadProgress.logo !== null ? (
                    <div className="text-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress.logo}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Uploading... {uploadProgress.logo}%
                      </p>
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Drag and drop your logo here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Recommended size: 200 x 80 pixels, PNG or SVG
                      </p>
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                      <button
                        onClick={() => document.getElementById('logo-upload').click()}
                        className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </AdminCard>
          
          {/* Dark mode toggle */}
          <AdminCard>
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Theme Mode</h2>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDarkModeToggle}
                  className={`
                    flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center
                    ${!theme.darkMode 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-gray-200 dark:border-gray-700'}
                  `}
                >
                  <SunIcon className="h-8 w-8 text-amber-500 mb-2" />
                  <span className="text-gray-900 dark:text-gray-100">Light</span>
                </button>
                <button
                  onClick={handleDarkModeToggle}
                  className={`
                    flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center
                    ${theme.darkMode 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-gray-200 dark:border-gray-700'}
                  `}
                >
                  <MoonIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-gray-900 dark:text-gray-100">Dark</span>
                </button>
              </div>
            </div>
          </AdminCard>
        </div>
        
        {/* Preview panel */}
        <div className="w-full lg:w-2/3">
          <AdminCard className="overflow-hidden">
            {/* Preview controls */}
            <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">Preview</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`
                    p-2 rounded-lg
                    ${previewMode === 'desktop' 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'}
                  `}
                >
                  <ComputerDesktopIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`
                    p-2 rounded-lg
                    ${previewMode === 'mobile' 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'}
                  `}
                >
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Preview content */}
            <div className="p-6 flex justify-center">
              <div className={`
                ${theme.darkMode ? 'bg-gray-900' : 'bg-white'}
                ${previewMode === 'mobile' 
                  ? 'w-72 h-[500px] rounded-[32px] shadow-xl border-8' 
                  : 'w-full max-w-3xl rounded-lg shadow-lg'}
                transition-all duration-300 overflow-hidden
                ${theme.darkMode && previewMode === 'mobile' ? 'border-gray-800' : 'border-gray-200'}
              `}>
                {/* Preview header */}
                <div 
                  className="p-4 flex items-center border-b"
                  style={{ 
                    borderColor: theme.darkMode ? '#374151' : '#e5e7eb',
                    backgroundColor: theme.darkMode ? '#111827' : '#ffffff' 
                  }}
                >
                  {/* Logo */}
                  <div className="flex-shrink-0 mr-3 h-8 w-8">
                    {theme.logoUrl ? (
                      <Image 
                        src={theme.logoUrl} 
                        alt="Logo" 
                        width={32} 
                        height={32}
                        className="h-8 w-auto"
                      />
                    ) : (
                      <div 
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <span className="text-white font-medium text-sm">A</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tenant name */}
                  <div className="flex-grow">
                    <h3 className={theme.darkMode ? 'text-white' : 'text-gray-900'}>
                      {tenant?.name || 'Tenant Name'}
                    </h3>
                  </div>
                  
                  {/* Nav items */}
                  {previewMode !== 'mobile' && (
                    <div className="flex items-center space-x-4">
                      {['Dashboard', 'Chat', 'Files', 'Analytics'].map((item, index) => (
                        <div 
                          key={item}
                          className={`
                            text-sm px-1 py-1 border-b-2 transition-colors
                            ${index === 0 
                              ? `border-current` 
                              : 'border-transparent'}
                          `}
                          style={{ 
                            color: index === 0 
                              ? theme.primaryColor 
                              : theme.darkMode ? '#9ca3af' : '#6b7280'
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Preview content */}
                <div 
                  className="p-4"
                  style={{ backgroundColor: theme.darkMode ? '#1f2937' : '#f9fafb' }}
                >
                  {/* Content header */}
                  <div className="mb-4">
                    <h2 
                      className={`text-xl font-semibold ${theme.darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      Dashboard
                    </h2>
                    <p className={theme.darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Welcome to your personalized dashboard
                    </p>
                  </div>
                  
                  {/* Mock stats cards */}
                  <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
                    {[
                      { label: 'Queries', value: '2,345' },
                      { label: 'Documents', value: '128' },
                      { label: 'Tokens', value: '1.2M' }
                    ].map((stat) => (
                      <div 
                        key={stat.label}
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: theme.darkMode ? '#111827' : '#ffffff' }}
                      >
                        <div className={`text-sm ${theme.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stat.label}
                        </div>
                        <div 
                          className="text-xl font-bold"
                          style={{ color: theme.primaryColor }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mock button */}
                  <div className="flex mt-6">
                    <button
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      New Conversation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
      
      {/* Save/Cancel buttons for mobile - fixed at bottom */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-3 flex-1 border border-gray-300 dark:border-gray-700 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-gray-700 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`
              px-4 py-3 flex-1 rounded-lg text-white
              ${saveStatus === 'saving' ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary-dark'}
            `}
          >
            {saveStatus === 'saving' ? (
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </div>
            ) : saveStatus === 'success' ? (
              <div className="flex items-center justify-center">
                <CheckIcon className="h-5 w-5 mr-2" />
                Saved!
              </div>
            ) : saveStatus === 'error' ? (
              <div className="flex items-center justify-center">
                <XMarkIcon className="h-5 w-5 mr-2" />
                Failed
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;