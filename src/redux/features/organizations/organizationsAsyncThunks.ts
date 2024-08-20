import { createAsyncThunk } from '@reduxjs/toolkit';

import { OrganizationService } from 'src/services';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';

export const requestOrganizationInternalTags = createAsyncThunk(
  'organizations/internalTags',
  async ({ organizationId }: { organizationId: number }, { rejectWithValue }) => {
    const response = await OrganizationService.getOrganizationInternalTags(organizationId);

    if (response !== null && response.requestSucceeded && response?.data?.internalTags !== undefined) {
      return response.data.internalTags;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateOrganizationInternalTags = createAsyncThunk(
  'internalTags/update',
  async (
    request: { organizationId: number; payload: UpdateOrganizationInternalTagsRequestPayload },
    { rejectWithValue }
  ) => {
    const response: Response2<number> = await OrganizationService.updateOrganizationInternalTags(
      request.organizationId,
      request.payload
    );

    if (response && response.requestSucceeded && response.data) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
