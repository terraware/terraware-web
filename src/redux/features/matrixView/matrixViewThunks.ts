import { createAsyncThunk } from '@reduxjs/toolkit';

import MatrixViewService, { MatrixViewSearchParams } from 'src/services/MatrixViewService';
import strings from 'src/strings';

export type ProjectsWithVariablesSearchResult = {
  id: number;
  name: string;
  country_name: string;
  acceleratorDetails: {
    'confirmedReforestableLand(raw)': number;
    projectLead: string;
  };
  variables: {
    stableId: string;
    id: string;
    variableName: string;
    type: string;
    isList?: boolean;
    isMultiselect?: boolean;
    values?: {
      variableValueId: string;
      options?: { id: string; name: string; position: string }[];
      'numberValue(raw)'?: number;
      textValue?: string;
      dateValue?: string;
      linkUrl?: string;
    }[];
  }[];
};

export const requestGetProjectsWithVariables = createAsyncThunk(
  'projectsWithVariables/get',
  async (request: MatrixViewSearchParams, { rejectWithValue }) => {
    const { fields, filters, sortOrder } = request;

    const response: ProjectsWithVariablesSearchResult[] | null = await MatrixViewService.searchProjects({
      fields,
      filters,
      sortOrder,
    });

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
