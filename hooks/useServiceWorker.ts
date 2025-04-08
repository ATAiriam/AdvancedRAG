import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';
import { useToast } from '@/components/ui/Toast';
import { registerServiceWorker, unregisterServiceWorker } from '@/lib/serviceWorker';

interface ServiceWorkerHookReturn {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isInstallPromptAvailable: boolean;
  workbox: Workbox | null;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  update: () => Promise<void>;
  showInstallPrompt: () => Promise<void>;
}

/**
 * Hook to manage service worker registration and updates
 */
export function useServiceWorker(): ServiceWorkerHookReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState<boolean>(false);
  
  const toast = useToast();

  // Check if service worker is supported
  useEffect(() => {
    const isServiceWorkerSupported = 
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator && 
      'Workbox' in window;
    
    setIsSupported(isServiceWorkerSupported);

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e);
      setIsInstallPromptAvailable(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  // Register service worker
  const register = async (): Promise<void> => {
    if (!isSupported) {
      console.warn('Service workers are not supported in this browser.');
      return;
    }

    try {
      const wb = registerServiceWorker();
      if (wb) {
        setWorkbox(wb);
        setIsRegistered(true);

        // Listen for update events
        wb.addEventListener('waiting', () => {
          setIsUpdateAvailable(true);
          toast.info('A new version is available', {
            action: {
              label: 'Update',
              onClick: () => {
                wb.messageSkipWaiting();
                window.location.reload();
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('Failed to register service worker:', error);
      toast.error('Failed to enable offline capabilities');
    }
  };

  // Unregister service worker
  const unregister = async (): Promise<void> => {
    try {
      await unregisterServiceWorker();
      setIsRegistered(false);
      setWorkbox(null);
      setIsUpdateAvailable(false);
      toast.success('Offline capabilities disabled');
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
      toast.error('Failed to disable offline capabilities');
    }
  };

  // Check for and apply updates
  const update = async (): Promise<void> => {
    if (!workbox || !isUpdateAvailable) return;

    try {
      workbox.messageSkipWaiting();
      window.location.reload();
    } catch (error) {
      console.error('Failed to update application:', error);
      toast.error('Failed to update application');
    }
  };

  // Show install prompt
  const showInstallPrompt = async (): Promise<void> => {
    if (!installPrompt) return;

    try {
      // Show the prompt
      const result = await installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      if (result.outcome === 'accepted') {
        toast.success('Application installed successfully');
      } else {
        toast.info('Installation declined');
      }
      
      // Reset the install prompt state
      setInstallPrompt(null);
      setIsInstallPromptAvailable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
      toast.error('Failed to show installation prompt');
    }
  };

  return {
    isSupported,
    isRegistered,
    isUpdateAvailable,
    isInstallPromptAvailable,
    workbox,
    register,
    unregister,
    update,
    showInstallPrompt,
  };
}

export default useServiceWorker;
