import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { 
  User, 
  login, 
  register, 
  logout, 
  getCurrentUser, 
  loginWithOAuth, 
  switchTenant, 
  clearError 
} from './slices/authSlice';

// Hook for authentication
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    error, 
    currentTenant 
  } = useAppSelector((state) => state.auth);

  // Login with email and password
  const handleLogin = async (email: string, password: string) => {
    await dispatch(login({ email, password })).unwrap();
  };

  // Register a new user
  const handleRegister = async (
    name: string, 
    email: string, 
    password: string, 
    tenantId?: string
  ) => {
    await dispatch(register({ name, email, password, tenantId })).unwrap();
  };

  // Logout
  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
  };

  // Get current user info
  const fetchCurrentUser = async () => {
    await dispatch(getCurrentUser()).unwrap();
  };

  // Login with OAuth provider
  const handleOAuthLogin = async (provider: string, token: string) => {
    await dispatch(loginWithOAuth({ provider, token })).unwrap();
  };

  // Switch tenant
  const handleSwitchTenant = async (tenantId: string) => {
    await dispatch(switchTenant(tenantId)).unwrap();
  };

  // Clear error
  const handleClearError = () => {
    dispatch(clearError());
  };

  // Check if user has a specific role
  const hasRole = (role: User['role'] | User['role'][]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    currentTenant,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getCurrentUser: fetchCurrentUser,
    loginWithOAuth: handleOAuthLogin,
    switchTenant: handleSwitchTenant,
    clearError: handleClearError,
    hasRole,
  };
};

// Hook to protect routes
export const useProtectedRoute = (
  requiredRoles?: User['role'] | User['role'][]
) => {
  const { isAuthenticated, user, isLoading, getCurrentUser } = useAuth();

  useEffect(() => {
    // If not authenticated, try to restore session
    if (!isAuthenticated && !isLoading) {
      getCurrentUser();
    }
  }, [isAuthenticated, isLoading, getCurrentUser]);

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRoles) return true;
    if (!user) return false;

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  return {
    isAuthenticated,
    isLoading,
    hasRequiredRole: hasRequiredRole(),
  };
};
