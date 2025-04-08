'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { hydrateAuthState } from './slices/authSlice';

// Hydration component to initialize store state from cache
const StoreHydration = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Hydrate auth state from cache on client side
    dispatch(hydrateAuthState());
  }, [dispatch]);

  return <>{children}</>;
};

// Redux provider with hydration
export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <StoreHydration>{children}</StoreHydration>
    </Provider>
  );
}
