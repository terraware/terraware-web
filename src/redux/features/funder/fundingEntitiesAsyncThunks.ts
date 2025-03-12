import { createAsyncThunk } from '@reduxjs/toolkit';

import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';

export const requestFundingEntity = createAsyncThunk(
  'funding-entities/get-one',
  async (userId: number, { rejectWithValue }) => {
    const response = await FundingEntityService.getUserFundingEntity(userId);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
