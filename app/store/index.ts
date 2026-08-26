'use client';

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer';

export { rootReducer };

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  enhancers: (getDefaultEnhancers) => {
    const enhancers = getDefaultEnhancers();
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const { composeWithDevTools } = require('@reduxjs/toolkit');
      return [
        composeWithDevTools({
          maxAge: 50,
          trace: false,
          traceLimit: 25,
          actionSanitizer: () => null,
          stateSanitizer: (state: any) => ({
            ...state,
            _persist: state._persist ? { version: state._persist.version } : undefined,
          }),
        }),
        ...enhancers,
      ];
    }
    return enhancers;
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
