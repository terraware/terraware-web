import { createAsyncThunk } from '@reduxjs/toolkit';

import { NurseryWithdrawalService } from 'src/services';
import { NurseryWithdrawalsCountParams, NurseryWithdrawalsSearchParams } from 'src/services/NurseryWithdrawalService';
import strings from 'src/strings';
import { FieldOptionsMap, SearchResponseElement } from 'src/types/Search';

export const requestListNurseryWithdrawals = createAsyncThunk(
  'nurseryWithdrawals/list',
  async (request: NurseryWithdrawalsSearchParams, { rejectWithValue }) => {
    const { organizationId, searchCriteria, sortOrder, limit, offset } = request;

    const response: SearchResponseElement[] | null = await NurseryWithdrawalService.listNurseryWithdrawals(
      organizationId,
      searchCriteria,
      sortOrder,
      limit,
      offset
    );

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestNurseryWithdrawalsFilterOptions = createAsyncThunk(
  'nurseryWithdrawals/filterOptions',
  async (request: { organizationId: number }, { rejectWithValue }) => {
    const { organizationId } = request;

    const response: FieldOptionsMap | null = await NurseryWithdrawalService.getFilterOptions(organizationId);

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCountNurseryWithdrawals = createAsyncThunk(
  'nurseryWithdrawals/count',
  async (request: NurseryWithdrawalsCountParams, { rejectWithValue }) => {
    const { organizationId, searchCriteria } = request;

    const response: number | null = await NurseryWithdrawalService.countNurseryWithdrawals(
      organizationId,
      searchCriteria
    );

    if (response !== null) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
