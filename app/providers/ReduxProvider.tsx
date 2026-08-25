'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/index';
import Spinner from '@/app/components/common/Spinner';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
