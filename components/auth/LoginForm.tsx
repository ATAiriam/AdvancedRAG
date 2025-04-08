'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, LockClosedIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/redux/hooks';
import { useToast } from '@/components/ui/Toast';
import OAuthButtons from './OAuthButtons';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface LoginFormProps {
  redirectUrl?: string;
  className?: string;
}

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

/**
 * Login form component with validation
 */
export function LoginForm({ redirectUrl, className }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showPassword, setShowPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Get redirect URL from props or query parameter
  useEffect(() => {
    const redirect = redirectUrl || searchParams?.get('redirect') || '/dashboard';
    setRedirectPath(redirect);
  }, [redirectUrl, searchParams]);

  // Clear any auth errors when form is shown
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      
      // Store remember me preference
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      // Redirect to dashboard or specified URL
      router.push(redirectPath);
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // Handle OAuth success
  const handleOAuthSuccess = () => {
    router.push(redirectPath);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {/* Form errors */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-500" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email field */}
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
                placeholder="you@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="email-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                  errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
                placeholder="••••••••"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {/* Toggle password visibility */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="password-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              />
              <label 
                htmlFor="rememberMe" 
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
          </div>

          {/* Submit button */}
          <div className="mb-6">
            <Button
              type="submit"
              isLoading={isLoading}
              isFullWidth
              size={isMobile ? "mobile-full" : "lg"}
            >
              Sign in
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth buttons */}
        <OAuthButtons onSuccess={handleOAuthSuccess} />

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
