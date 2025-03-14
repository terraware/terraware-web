import { createAsyncThunk } from '@reduxjs/toolkit';

import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

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

export const requestFundingEntities = createAsyncThunk(
  'funding-entities/list',
  async (
    request: {
      locale: string | null;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { locale, search, searchSortOrder } = request;

    const response = await FundingEntityService.listFundingEntities(locale, search, searchSortOrder);

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
