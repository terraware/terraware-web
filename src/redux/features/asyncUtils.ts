import { ActionReducerMapBuilder, AsyncThunk, CaseReducers } from '@reduxjs/toolkit';

export type Statuses = 'pending' | 'success' | 'error';

export type StatusT<T> = { status: Statuses; data?: T };

export type Status = StatusT<unknown>; // when data is not relevant in the response

export const buildReducers =
  <T>(asyncThunk: AsyncThunk<any, any, any>, useArgAsKey?: boolean) =>
  (builder: CaseReducers<any, any> | ActionReducerMapBuilder<any>) =>
    (builder as any)
      .addCase(asyncThunk.pending, setStatus<T>('pending', useArgAsKey))
      .addCase(asyncThunk.fulfilled, setStatus<T>('success', useArgAsKey))
      .addCase(asyncThunk.rejected, setStatus<T>('error', useArgAsKey));

export const setStatus =
  <T>(status: Statuses, useArgAsKey?: boolean) =>
  (state: any, action: any) => {
    const key = useArgAsKey ? action.meta.arg : action.meta.requestId;
    const data: T = action.payload as T;
    state[key] = { status, data };
  };
