'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  ExclamationCircleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/redux/hooks';
import { useToast } from '@/components/ui/Toast';
import OAuthButtons from './OAuthButtons';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface RegisterFormProps {
  tenantId?: string;
  inviteOnly?: boolean;
  allowTenantCreation?: boolean;
  className?: string;
}

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: string;
  organizationName?: string;
  agreeToTerms: boolean;
};

/**
 * Registration form component with validation
 */
export function RegisterForm({ 
  tenantId, 
  inviteOnly = false, 
  allowTenantCreation = false,
  className 
}: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [createTenant, setCreateTenant] = useState(false);
  const [tenantParams, setTenantParams] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      tenantId: tenantId || '',
      organizationName: '',
      agreeToTerms: false,
    },
  });

  // Watch password field for strength calculation
  const watchPassword = watch('password');

  // Get tenant ID from props or query parameter
  useEffect(() => {
    const tenant = tenantId || searchParams?.get('tenant');
    setTenantParams(tenant);
  }, [tenantId, searchParams]);

  // Clear any auth errors when form is shown
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Calculate password strength
  useEffect(() => {
    if (!watchPassword) {
      setPasswordStrength(0);
      return;
    }

    // Simple password strength calculation
    let strength = 0;
    
    // Length check
    if (watchPassword.length >= 8) strength += 25;
    
    // Lowercase check
    if (/[a-z]/.test(watchPassword)) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(watchPassword)) strength += 25;
    
    // Number/special char check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(watchPassword)) strength += 25;
    
    setPasswordStrength(strength);
  }, [watchPassword]);

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Determine which tenant ID to use
      let finalTenantId: string | undefined;
      
      if (createTenant && allowTenantCreation) {
        // In a real implementation, you would create the tenant first
        // and then use the returned tenant ID for registration
        toast.info('Creating tenant...');
        // For now, we'll just use the organization name as placeholder
        finalTenantId = undefined; // Server will create tenant
      } else {
        finalTenantId = data.tenantId;
      }
      
      // Register the user
      await registerUser(data.name, data.email, data.password, finalTenantId);
      toast.success('Registration successful!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  // Handle OAuth success
  const handleOAuthSuccess = () => {
    router.push('/dashboard');
  };

  // Get strength color
  const getStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500 dark:bg-red-600';
    if (passwordStrength < 50) return 'bg-orange-500 dark:bg-orange-600';
    if (passwordStrength < 75) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-green-500 dark:bg-green-600';
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
          {/* Full Name field */}
          <div className="mb-4">
            <label 
              htmlFor="name" 
              className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
                placeholder="John Doe"
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="name-error">
                {errors.name.message}
              </p>
            )}
          </div>

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
          <div className="mb-4">
            <label 
              htmlFor="password" 
              className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                    message: 'Password must contain at least one letter and one number',
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

            {/* Password strength indicator */}
            {watchPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Password strength:
                  </label>
                  <span className="text-xs font-medium">
                    {passwordStrength < 25
                      ? 'Weak'
                      : passwordStrength < 50
                      ? 'Fair'
                      : passwordStrength < 75
                      ? 'Good'
                      : 'Strong'}
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => 
                    value === watch('password') || 'Passwords do not match',
                })}
                className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                  errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
                placeholder="••••••••"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {/* Toggle password visibility */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="confirmPassword-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Tenant Selection/Creation */}
          {!inviteOnly && allowTenantCreation && (
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <input
                  id="createTenant"
                  type="checkbox"
                  checked={createTenant}
                  onChange={(e) => setCreateTenant(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
                />
                <label 
                  htmlFor="createTenant" 
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Create a new organization
                </label>
              </div>

              {createTenant ? (
                <div>
                  <label 
                    htmlFor="organizationName" 
                    className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  >
                    Organization Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="organizationName"
                      type="text"
                      {...register('organizationName', {
                        required: createTenant ? 'Organization name is required' : false,
                      })}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.organizationName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
                      placeholder="Acme Inc."
                      aria-invalid={errors.organizationName ? 'true' : 'false'}
                    />
                    {errors.organizationName && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.organizationName && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="organizationName-error">
                      {errors.organizationName.message}
                    </p>
                  )}
                </div>
              ) : tenantParams ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You will join the organization you were invited to.
                </p>
              ) : (
                <div>
                  <label 
                    htmlFor="tenantId" 
                    className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  >
                    Select Organization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="tenantId"
                      {...register('tenantId', {
                        required: !createTenant && !tenantParams ? 'Organization selection is required' : false,
                      })}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.tenantId ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
                      aria-invalid={errors.tenantId ? 'true' : 'false'}
                    >
                      <option value="">Select an organization</option>
                      {/* This would be populated from an API call in a real app */}
                      <option value="tenant-1">Acme Corporation</option>
                      <option value="tenant-2">Wayne Enterprises</option>
                      <option value="tenant-3">Stark Industries</option>
                    </select>
                    {errors.tenantId && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.tenantId && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="tenantId-error">
                      {errors.tenantId.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  {...register('agreeToTerms', {
                    required: 'You must agree to the terms and conditions',
                  })}
                  className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 ${
                    errors.agreeToTerms ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  aria-invalid={errors.agreeToTerms ? 'true' : 'false'}
                />
              </div>
              <div className="ml-3 text-sm">
                <label 
                  htmlFor="agreeToTerms" 
                  className={`font-medium ${
                    errors.agreeToTerms ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="agreeToTerms-error">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>
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
              Create Account
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

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;