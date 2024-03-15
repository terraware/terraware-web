import { createAsyncThunk } from '@reduxjs/toolkit';

import { UserService } from 'src/services';
import { UserResponse } from 'src/services/UserService';
import strings from 'src/strings';

export const requestGetUser = createAsyncThunk('users/get-one', async (userId: number, { rejectWithValue }) => {
  const response: UserResponse = await UserService.get(userId);

  if (response.requestSucceeded) {
    return response;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestSearchUserByEmail = createAsyncThunk(
  'users/by-email',
  async (email: string, { rejectWithValue }) => {
    const response: UserResponse = await UserService.getUserByEmail(email);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
