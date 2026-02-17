import { createAsyncThunk } from '@reduxjs/toolkit';

import AcceleratorService, { AcceleratorOrgData } from 'src/services/AcceleratorService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestAcceleratorOrgs = createAsyncThunk(
  'acceleratorOrgs/list',
  async (
    request: {
      locale: string | null;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { locale, search, searchSortOrder } = request;

    const response: Response & AcceleratorOrgData = await AcceleratorService.listAcceleratorOrgs(
      locale,
      search,
      searchSortOrder
    );

    if (response && response.requestSucceeded) {
      return response.organizations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAssignTerraformationContact = createAsyncThunk(
  'terraformationContact/assign',
  async (request: { organizationId: number; terraformationContactId: number }, { rejectWithValue }) => {
    const { organizationId, terraformationContactId } = request;

    const response = await AcceleratorService.assignTerraformationContact(organizationId, terraformationContactId);

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
