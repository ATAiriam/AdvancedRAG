'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/redux/hooks';
import { useToast } from '@/components/ui/Toast';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Component to display OAuth login buttons
 * Supports Google, Microsoft, and Apple login
 */
export function OAuthButtons({ onSuccess, onError, className }: OAuthButtonsProps) {
  const { loginWithOAuth, isLoading } = useAuth();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Load OAuth SDKs
  useEffect(() => {
    // Load Google SDK
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    // Load Microsoft SDK
    const loadMicrosoftScript = () => {
      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    // Load scripts only on client side
    if (typeof window !== 'undefined') {
      loadGoogleScript();
      loadMicrosoftScript();
    }
  }, []);

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      
      // Initialize Google Sign-In
      if (!window.google || !window.google.accounts) {
        throw new Error('Google SDK not loaded');
      }

      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.code) {
            try {
              // Exchange code for token on your server
              const result = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: response.code }),
              });

              const data = await result.json();
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Login with token
              await loginWithOAuth('google', data.token);
              toast.success('Logged in with Google');
              onSuccess?.();
            } catch (error: any) {
              toast.error(error.message || 'Failed to authenticate with Google');
              onError?.(error.message || 'Failed to authenticate with Google');
            }
          }
          setIsGoogleLoading(false);
        },
        error_callback: (error: any) => {
          console.error('Google auth error:', error);
          toast.error('Failed to authenticate with Google');
          onError?.('Failed to authenticate with Google');
          setIsGoogleLoading(false);
        },
      });

      client.requestCode();
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'Failed to authenticate with Google');
      onError?.(error.message || 'Failed to authenticate with Google');
      setIsGoogleLoading(false);
    }
  };

  // Handle Microsoft login
  const handleMicrosoftLogin = async () => {
    try {
      setIsMicrosoftLoading(true);

      // Initialize Microsoft Authentication Library
      if (!window.msal) {
        throw new Error('Microsoft SDK not loaded');
      }

      const msalConfig = {
        auth: {
          clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID as string,
          authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID}`,
          redirectUri: window.location.origin,
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false,
        },
      };

      const msalInstance = new window.msal.PublicClientApplication(msalConfig);

      const loginRequest = {
        scopes: ['user.read'],
      };

      try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        
        // Exchange token for your server's token
        const result = await fetch('/api/auth/microsoft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: loginResponse.accessToken }),
        });

        const data = await result.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Login with token
        await loginWithOAuth('microsoft', data.token);
        toast.success('Logged in with Microsoft');
        onSuccess?.();
      } catch (error: any) {
        if (error.errorCode !== 'user_cancelled') {
          toast.error(error.message || 'Failed to authenticate with Microsoft');
          onError?.(error.message || 'Failed to authenticate with Microsoft');
        }
      }
      
      setIsMicrosoftLoading(false);
    } catch (error: any) {
      console.error('Microsoft auth error:', error);
      toast.error(error.message || 'Failed to authenticate with Microsoft');
      onError?.(error.message || 'Failed to authenticate with Microsoft');
      setIsMicrosoftLoading(false);
    }
  };

  // Handle Apple login
  const handleAppleLogin = async () => {
    try {
      setIsAppleLoading(true);
      
      // Apple Sign In is typically implemented via their JS SDK or a redirect flow
      // This is a simplified example
      window.location.href = `/api/auth/apple?redirect=${encodeURIComponent(window.location.href)}`;
      
      // The actual authentication will happen on the server and redirect back
      // No need to set loading to false as we're redirecting
    } catch (error: any) {
      console.error('Apple auth error:', error);
      toast.error(error.message || 'Failed to authenticate with Apple');
      onError?.(error.message || 'Failed to authenticate with Apple');
      setIsAppleLoading(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-3 w-full ${className}`}>
      {/* Google Button */}
      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        isLoading={isGoogleLoading}
        disabled={isLoading || isGoogleLoading || isMicrosoftLoading || isAppleLoading}
        aria-label="Continue with Google"
        size={isMobile ? "mobile-full" : "default"}
        className="relative"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        }
      >
        Continue with Google
      </Button>

      {/* Microsoft Button */}
      <Button
        variant="outline"
        onClick={handleMicrosoftLogin}
        isLoading={isMicrosoftLoading}
        disabled={isLoading || isGoogleLoading || isMicrosoftLoading || isAppleLoading}
        aria-label="Continue with Microsoft"
        size={isMobile ? "mobile-full" : "default"}
        className="relative"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="20" height="20">
            <path fill="#f1511b" d="M11.5 0h-11.5v11.5h11.5v-11.5z" />
            <path fill="#80cc28" d="M23 0h-11.5v11.5h11.5v-11.5z" />
            <path fill="#00adef" d="M11.5 11.5h-11.5v11.5h11.5v-11.5z" />
            <path fill="#fbbc09" d="M23 11.5h-11.5v11.5h11.5v-11.5z" />
          </svg>
        }
      >
        Continue with Microsoft
      </Button>

      {/* Apple Button */}
      <Button
        variant="outline"
        onClick={handleAppleLogin}
        isLoading={isAppleLoading}
        disabled={isLoading || isGoogleLoading || isMicrosoftLoading || isAppleLoading}
        aria-label="Continue with Apple"
        size={isMobile ? "mobile-full" : "default"}
        className="relative"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.19 1.79 2.5 3.12 2.45s1.93-.82 3.09-.82 1.84.82 3.1.79 2.1-1.19 2.89-2.39a11 11 0 0 0 1.29-2.67 4.41 4.41 0 0 1-2.03-4.2z"
              fill="currentColor"
            />
          </svg>
        }
      >
        Continue with Apple
      </Button>
    </div>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
    msal?: {
      PublicClientApplication: new (config: any) => {
        loginPopup: (request: any) => Promise<any>;
      };
    };
  }
}

export default OAuthButtons;