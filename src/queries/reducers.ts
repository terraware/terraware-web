import { baseApi } from './baseApi';

export const rtkReducers = {
  [baseApi.reducerPath]: baseApi.reducer,
};

export const rtkMiddleware = [baseApi.middleware];
