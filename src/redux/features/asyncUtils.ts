import { ActionReducerMapBuilder, AsyncThunk, CaseReducers } from '@reduxjs/toolkit';

export type Statuses = 'pending' | 'success' | 'error';

export type Status = { status: Statuses };

export const buildReducers =
  (asyncThunk: AsyncThunk<any, any, any>) => (builder: CaseReducers<any, any> | ActionReducerMapBuilder<any>) =>
    (builder as any)
      .addCase(asyncThunk.pending, setStatus('pending'))
      .addCase(asyncThunk.fulfilled, setStatus('success'))
      .addCase(asyncThunk.rejected, setStatus('error'));

const setStatus = (status: Statuses) => (state: any, action: any) => {
  const requestId = action.meta.requestId;
  state[requestId] = { status };
};
