import { createAsyncThunk } from '@reduxjs/toolkit';

import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';

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
