import { fundingEntitiesApi } from './funder/fundingEntities';

export const rtkReducers = {
  [fundingEntitiesApi.reducerPath]: fundingEntitiesApi.reducer,
};

export const rtkMiddleware = [fundingEntitiesApi.middleware];
