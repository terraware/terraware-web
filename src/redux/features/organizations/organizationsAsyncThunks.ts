import { createAsyncThunk } from '@reduxjs/toolkit';

import { OrganizationService } from 'src/services';
import strings from 'src/strings';

export const requestOrganizationFeatures = createAsyncThunk(
  'organizations/features',
  async ({ organizationId }: { organizationId: number }, { rejectWithValue }) => {
    const response = await OrganizationService.getOrganizationFeatures(organizationId);

    if (response !== null && response.requestSucceeded) {
      const { applications, deliverables, modules, reports, seedFundReports } = response;
      return { applications, deliverables, modules, reports, seedFundReports };
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
