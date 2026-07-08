import { createAsyncThunk } from '@reduxjs/toolkit';

import { PreferencesService } from 'src/services';
import { Response2 } from 'src/services/HttpService';
import {
  UpdateUserCookieConsentRequestPayload,
  UpdateUserCookieConsentResponsePayload,
} from 'src/services/PreferencesService';
import strings from 'src/strings';

export const requestUserCookieConsentUpdate = createAsyncThunk(
  'users/cookie-consent/update',
  async (payload: UpdateUserCookieConsentRequestPayload, { rejectWithValue }) => {
    const response: Response2<UpdateUserCookieConsentResponsePayload> =
      await PreferencesService.updateUserCookieConsentPreferences(payload);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
