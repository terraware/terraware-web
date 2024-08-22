import { createAsyncThunk } from '@reduxjs/toolkit';

import { OrganizationService } from 'src/services';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';
import { UpdateOrganizationInternalTagsRequestPayload } from 'src/types/Organization';

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

export type UpdateOrganizationInternalTagsRequestPayloadWithId = UpdateOrganizationInternalTagsRequestPayload & {
  organizationId: number;
};

export const ACCELERATOR_ORG_TAG_ID = 4;

export const requestRemoveAcceleratorOrganizations = createAsyncThunk(
  'internalTags/remove-accelerator-orgs',
  async (ids: number[], { rejectWithValue }) => {
    let allSucceeded = true;
    const promises = ids.map(async (id) => {
      const oldTags = await OrganizationService.getOrganizationInternalTags(id);
      const newTags = oldTags.internalTags.filter((it) => it !== ACCELERATOR_ORG_TAG_ID);
      return OrganizationService.updateOrganizationInternalTags(id, { tagIds: newTags });
    });

    const results = await Promise.all(promises);

    results.forEach((res) => {
      if (!res.requestSucceeded) {
        allSucceeded = false;
      }
    });

    if (allSucceeded) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAddAcceleratorOrganization = createAsyncThunk(
  'internalTags/add-accelerator-org',
  async (id: number, { rejectWithValue }) => {
    const oldTags = await OrganizationService.getOrganizationInternalTags(id);
    const newTags = [...oldTags.internalTags, ACCELERATOR_ORG_TAG_ID];
    const response: Response2<number> = await OrganizationService.updateOrganizationInternalTags(id, {
      tagIds: newTags,
    });

    if (response && response.requestSucceeded && response.data) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListAllOrganizationsInternalTags = createAsyncThunk(
  'organizations/list-all',
  async (_, { rejectWithValue }) => {
    const response = await OrganizationService.getAllOrganizationsInternalTags();
    if (response !== null && response.requestSucceeded && response.organizations !== undefined) {
      return response.organizations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
