'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/redux/hooks';
import { useTheme } from '@/hooks/useTheme';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  
  const redirectParam = searchParams?.get('redirect') || '/dashboard';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectParam);
    }
  }, [isAuthenticated, isLoading, router, redirectParam]);

  // Don't render the page if we're already authenticated and redirecting
  if (isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <div className="relative h-12 w-12">
              {/* Replace with your actual logo */}
              <div className="h-12 w-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                A
              </div>
            </div>
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            create a new account
          </Link>
        </p>
      </div>

      {/* Login form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm redirectUrl={redirectParam} />
        
        {/* Terms and privacy links */}
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
