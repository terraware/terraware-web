import { createAsyncThunk } from '@reduxjs/toolkit';

import UserInternalInterestsService from 'src/services/UserInternalInterestsService';
import strings from 'src/strings';
import { User } from 'src/types/User';
import { InternalInterest } from 'src/types/UserInternalInterests';

export const requestGetUserInternalInterests = createAsyncThunk(
  'userInternalInterests/get-for-user',
  async (userId: number, { rejectWithValue }) => {
    const response = await UserInternalInterestsService.get(userId);
    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateUserInternalInterests = createAsyncThunk(
  'userInternalInterests/update-for-user',
  async (request: { user: User; internalInterests: InternalInterest[] }, { dispatch, rejectWithValue }) => {
    const { user, internalInterests } = request;

    const response = await UserInternalInterestsService.update(user, internalInterests);
    if (response && response.requestSucceeded) {
      dispatch(requestGetUserInternalInterests(user.id));
      return user.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
