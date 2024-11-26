import { createAsyncThunk } from '@reduxjs/toolkit';

import { OrganizationUserService } from 'src/services';
import strings from 'src/strings';

export const requestListOrganizationUsers = createAsyncThunk(
  'organizationUsers/list',
  async (
    request: {
      organizationId: number;
    },
    { rejectWithValue }
  ) => {
    const { organizationId } = request;

    const response = await OrganizationUserService.getOrganizationUsers(organizationId);
    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
