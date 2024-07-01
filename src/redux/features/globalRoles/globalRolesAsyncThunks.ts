import { createAsyncThunk } from '@reduxjs/toolkit';

import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import GlobalRolesService from 'src/services/GlobalRolesService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { User, UserGlobalRole } from 'src/types/User';

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

export const requestDeleteGlobalRolesForUsers = createAsyncThunk(
  'globalRoles/delete-for-users',
  async (request: { users: User[] }, { rejectWithValue }) => {
    const { users } = request;

    const response: Response = await GlobalRolesService.deleteRoles(users);
    if (response && response.requestSucceeded) {
      return users.map((user) => user.id);
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateGlobalRolesUser = createAsyncThunk(
  'globalRoles/update-for-user',
  async (request: { user: User; globalRoles: UserGlobalRole[] }, { dispatch, rejectWithValue }) => {
    const { user, globalRoles } = request;

    const response: Response = await GlobalRolesService.update(user, globalRoles);
    if (response && response.requestSucceeded) {
      dispatch(requestGetUser(user.id));
      return user.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
