import { createAsyncThunk } from '@reduxjs/toolkit';

import GlobalRolesService from 'src/services/GlobalRolesService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import { GlobalRole, UserWithGlobalRoles } from 'src/types/GlobalRoles';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestListGlobalRolesUsers = createAsyncThunk(
  'globalRoles/list',
  async (
    request: {
      locale: string | null;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { locale, search, searchSortOrder } = request;

    const response = await GlobalRolesService.list(locale, search, searchSortOrder);
    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateGlobalRolesUser = createAsyncThunk(
  'globalRoles/update-for-user',
  async (request: { user: UserWithGlobalRoles; globalRole: GlobalRole }, { rejectWithValue }) => {
    const { user, globalRole } = request;

    const response: Response = await GlobalRolesService.update(user, globalRole);
    if (response && response.requestSucceeded) {
      return user.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
