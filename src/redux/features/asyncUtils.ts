import { ActionReducerMapBuilder, AsyncThunk, CaseReducers } from '@reduxjs/toolkit';

export type Statuses = 'pending' | 'success' | 'error';

export type StatusT<T> = { status: Statuses; data?: T };

export type Status = StatusT<unknown>; // when data is not relevant in the response

export const buildReducers =
  <T>(asyncThunk: AsyncThunk<any, any, any>, useArgAsKey?: boolean, compositeKeyFn?: (args: unknown) => string) =>
  (builder: CaseReducers<any, any> | ActionReducerMapBuilder<any>) =>
    (builder as any)
      .addCase(asyncThunk.pending, setStatus<T>('pending', useArgAsKey, compositeKeyFn))
      .addCase(asyncThunk.fulfilled, setStatus<T>('success', useArgAsKey, compositeKeyFn))
      .addCase(asyncThunk.rejected, setStatus<T>('error', useArgAsKey, compositeKeyFn));

export const setStatus =
  <T>(status: Statuses, useArgAsKey?: boolean, compositeKeyFn?: (arg: unknown) => string) =>
  (state: any, action: any) => {
    const data: T = action.payload as T;

    state[action.meta.requestId] = { status, data };

    if (!useArgAsKey) {
      return;
    }

    let key = action.meta.arg;

    if (compositeKeyFn) {
      const compositeKey = compositeKeyFn(action.meta.arg);
      if (compositeKey !== '') {
        key = compositeKey;
      }
    }

    state[key] = { status, data };
  };
