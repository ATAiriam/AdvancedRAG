import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';

// Import other reducers as needed
// import filesReducer from './slices/filesSlice';
// import chatReducer from './slices/chatSlice';
// import dashboardReducer from './slices/dashboardSlice';
// import tenantReducer from './slices/tenantSlice';
// import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers as needed
    // files: filesReducer,
    // chat: chatReducer,
    // dashboard: dashboardReducer,
    // tenant: tenantReducer,
    // user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/hydrate/fulfilled'],
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
