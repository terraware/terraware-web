import { ActionReducerMapBuilder, AsyncThunk, CaseReducers } from '@reduxjs/toolkit';

export type Statuses = 'pending' | 'success' | 'error';

export type StatusT<T> = { status: Statuses; data?: T };

export type Status = StatusT<unknown>; // when data is not relevant in the response

export const buildReducers =
  <T>(asyncThunk: AsyncThunk<any, any, any>) =>
  (builder: CaseReducers<any, any> | ActionReducerMapBuilder<any>) =>
    (builder as any)
      .addCase(asyncThunk.pending, setStatus<T>('pending'))
      .addCase(asyncThunk.fulfilled, setStatus<T>('success'))
      .addCase(asyncThunk.rejected, setStatus<T>('error'));

export const setStatus =
  <T>(status: Statuses) =>
  (state: any, action: any) => {
    const requestId = action.meta.requestId;
    const data: T = action.payload as T;
    state[requestId] = { status, data };
  };
