import { createAsyncThunk } from '@reduxjs/toolkit';

import MatrixViewService, { MatrixViewSearchParams } from 'src/services/MatrixViewService';
import strings from 'src/strings';

export type ProjectsWithVariablesSearchResult = {
  id: number;
  name: string;
  country_name: string;
  acceleratorDetails: {
    confirmedReforestableLand: string;
    projectLead: string;
  };
  variableValues: {
    stableId: string;
    variableId: string;
    variableType: string;
    variableValueId: string;
    isMultiselect?: boolean;
    options?: { id: string; name: string; position: string }[];
    numberValue?: string;
    textValue?: string;
    dateValue?: string;
  }[];
};

export const requestGetProjectsWithVariables = createAsyncThunk(
  'projectsWithVariables/get',
  async (request: MatrixViewSearchParams, { rejectWithValue }) => {
    const { fields, searchCriteria, sortOrder } = request;

    const response: ProjectsWithVariablesSearchResult[] | null = await MatrixViewService.searchProjects({
      fields,
      searchCriteria,
      sortOrder,
    });

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
