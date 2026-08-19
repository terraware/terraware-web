import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import 'src/queries/extensions';
import { rtkMiddleware } from 'src/queries/reducers';

import { type RootState, rootReducer } from './rootReducer';

/**
 * Build a fresh store. The app uses the `store` singleton below, but tests need an isolated store
 * per test case so that RTK Query cache entries and feature slice state don't leak between them.
 */
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).concat(rtkMiddleware);
    },
  });

// configure the root store
export const store = makeStore();

setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = typeof store.dispatch;

export type { RootState };

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
