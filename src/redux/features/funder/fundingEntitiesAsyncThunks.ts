import { createAsyncThunk } from '@reduxjs/toolkit';

import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

export const requestFundingEntityForUser = createAsyncThunk(
  'funding-entities/get-for-user',
  async (userId: number, { rejectWithValue }) => {
    const response = await FundingEntityService.getUserFundingEntity(userId);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestFundingEntity = createAsyncThunk(
  'funding-entities/get',
  async (fundingEntityId: number, { rejectWithValue }) => {
    const response = await FundingEntityService.get(fundingEntityId);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestFundingEntities = createAsyncThunk('funding-entities/list', async (_, { rejectWithValue }) => {
  const response = await FundingEntityService.listFundingEntities();

  if (response && response.requestSucceeded) {
    return response;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestUpdateFundingEntity = createAsyncThunk(
  'funding-entities/update',
  async (request: { fundingEntity: FundingEntity }, { rejectWithValue }) => {
    const { fundingEntity } = request;

    const response = await FundingEntityService.update(fundingEntity);
    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateFundingEntity = createAsyncThunk(
  'funding-entities/create',
  async (request: { fundingEntity: FundingEntity }, { rejectWithValue }) => {
    const { fundingEntity } = request;

    const response = await FundingEntityService.create(fundingEntity);
    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
