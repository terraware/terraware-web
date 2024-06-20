import { createAsyncThunk } from '@reduxjs/toolkit';

import { PreferencesService, UserService } from 'src/services';
import { Response2 } from 'src/services/HttpService';
import {
  UpdateUserCookieConsentRequestPayload,
  UpdateUserCookieConsentResponsePayload,
} from 'src/services/PreferencesService';
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

export const requestUserCookieConsentUpdate = createAsyncThunk(
  'users/cookie-consent/update',
  async (
    { payload, reloadUser }: { payload: UpdateUserCookieConsentRequestPayload; reloadUser: () => void },
    { rejectWithValue }
  ) => {
    const response: Response2<UpdateUserCookieConsentResponsePayload> =
      await PreferencesService.updateUserCookieConsentPreferences(payload);

    if (response.requestSucceeded) {
      reloadUser();
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
