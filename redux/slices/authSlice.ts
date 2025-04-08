import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setCache, getCache, removeCache } from '@/lib/cache';
import axios from 'axios';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contributor' | 'reviewer' | 'viewer';
  tenantId: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentTenant: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  tenantId?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Cache keys
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const CURRENT_TENANT_KEY = 'current_tenant';

// API client
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getCache<string>(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Signal that user needs to login again
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store in cache
    await setCache(AUTH_TOKEN_KEY, response.data.token, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
    await setCache(AUTH_USER_KEY, response.data.user);
    await setCache(CURRENT_TENANT_KEY, response.data.user.tenantId);
    
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to login. Please check your credentials and try again.'
    );
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterCredentials,
  { rejectValue: string }
>('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    
    // Store in cache
    await setCache(AUTH_TOKEN_KEY, response.data.token, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
    await setCache(AUTH_USER_KEY, response.data.user);
    await setCache(CURRENT_TENANT_KEY, response.data.user.tenantId);
    
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to register. Please try again.'
    );
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    // Try to get from cache first
    const cachedUser = await getCache<User>(AUTH_USER_KEY);
    
    if (cachedUser) {
      // If user is in cache, validate with server
      const response = await api.get<User>('/auth/me');
      
      // Update cache with fresh data
      await setCache(AUTH_USER_KEY, response.data);
      await setCache(CURRENT_TENANT_KEY, response.data.tenantId);
      
      return response.data;
    } else {
      // If not in cache, try to get from server
      const response = await api.get<User>('/auth/me');
      
      // Store in cache
      await setCache(AUTH_USER_KEY, response.data);
      await setCache(CURRENT_TENANT_KEY, response.data.tenantId);
      
      return response.data;
    }
  } catch (error: any) {
    // Clear cache on error
    await removeCache(AUTH_TOKEN_KEY);
    await removeCache(AUTH_USER_KEY);
    await removeCache(CURRENT_TENANT_KEY);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Session expired. Please login again.'
    );
  }
});

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Call logout endpoint
    await api.post('/auth/logout');
    
    // Clear cache regardless of response
    await removeCache(AUTH_TOKEN_KEY);
    await removeCache(AUTH_USER_KEY);
    await removeCache(CURRENT_TENANT_KEY);
    
    return;
  } catch (error: any) {
    // Still clear cache even if API call fails
    await removeCache(AUTH_TOKEN_KEY);
    await removeCache(AUTH_USER_KEY);
    await removeCache(CURRENT_TENANT_KEY);
    
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to logout. Please try again.'
    );
  }
});

export const loginWithOAuth = createAsyncThunk<
  AuthResponse,
  { provider: string; token: string },
  { rejectValue: string }
>('auth/loginWithOAuth', async ({ provider, token }, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>(`/auth/oauth/${provider}`, { token });
    
    // Store in cache
    await setCache(AUTH_TOKEN_KEY, response.data.token, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
    await setCache(AUTH_USER_KEY, response.data.user);
    await setCache(CURRENT_TENANT_KEY, response.data.user.tenantId);
    
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error?.message || 
      'Failed to login with social provider. Please try again.'
    );
  }
});

export const switchTenant = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('auth/switchTenant', async (tenantId, { rejectWithValue }) => {
  try {
    await setCache(CURRENT_TENANT_KEY, tenantId);
    return;
  } catch (error: any) {
    return rejectWithValue('Failed to switch tenant');
  }
});

// Initialize state with cached values if available
const getInitialState = async (): Promise<AuthState> => {
  const token = await getCache<string>(AUTH_TOKEN_KEY);
  const user = await getCache<User>(AUTH_USER_KEY);
  const currentTenant = await getCache<string>(CURRENT_TENANT_KEY);
  
  return {
    user: user || null,
    token: token || null,
    isAuthenticated: !!token && !!user,
    isLoading: false,
    error: null,
    currentTenant: currentTenant || (user ? user.tenantId : null),
  };
};

// Initial state fallback for SSR
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  currentTenant: null,
};

// Hydrate state from cache on client side
export const hydrateAuthState = createAsyncThunk(
  'auth/hydrate',
  async () => {
    if (typeof window !== 'undefined') {
      return await getInitialState();
    }
    return initialState;
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Hydrate
    builder.addCase(hydrateAuthState.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.currentTenant = action.payload.user.tenantId;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload || 'Failed to login';
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.currentTenant = action.payload.user.tenantId;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to register';
    });
    
    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.currentTenant = action.payload.tenantId;
      state.error = null;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.currentTenant = null;
      state.error = action.payload || 'Failed to get current user';
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.currentTenant = null;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.currentTenant = null;
      state.error = null;
    });
    
    // OAuth login
    builder.addCase(loginWithOAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithOAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.currentTenant = action.payload.user.tenantId;
      state.error = null;
    });
    builder.addCase(loginWithOAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to login with social provider';
    });
    
    // Switch tenant
    builder.addCase(switchTenant.fulfilled, (state, action) => {
      state.currentTenant = action.meta.arg;
    });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
