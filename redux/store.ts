import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';

// Import other reducers as needed
// import filesReducer from './slices/filesSlice';
// import chatReducer from './slices/chatSlice';
// import tenantReducer from './slices/tenantSlice';
// import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    // Add other reducers as needed
    // files: filesReducer,
    // chat: chatReducer,
    // tenant: tenantReducer,
    // user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/hydrate/fulfilled', 'dashboard/hydrate/fulfilled'],
        // Ignore these field paths in state
        ignoredPaths: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
