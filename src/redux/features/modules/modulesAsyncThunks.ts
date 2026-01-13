import { createAsyncThunk } from '@reduxjs/toolkit';

import { SearchService } from 'src/services';
import ModuleService from 'src/services/ModuleService';
import strings from 'src/strings';
import { ModuleCohortsSearchResult, ModuleProjectSearchResult, ModuleSearchResult } from 'src/types/Module';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';

export const requestGetModule = createAsyncThunk(
  'modules/get',
  async (request: { moduleId: number }, { rejectWithValue }) => {
    const response = await ModuleService.get(request.moduleId);

    if (response !== null && response.requestSucceeded && response?.data?.module !== undefined) {
      return response.data.module;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModules = createAsyncThunk('modules/list', async (_, { rejectWithValue }) => {
  const response = await ModuleService.list();

  if (response !== null && response.requestSucceeded && response?.data?.modules !== undefined) {
    return response.data.modules;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestListModuleProjects = createAsyncThunk(
  'modules/listProjects',
  async (organizationId: number, { rejectWithValue }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'projects',
      fields: ['id', 'cohorts.cohortModules.module_id'],
      search: {
        operation: 'field',
        field: 'organization.id',
        type: 'Exact',
        values: [organizationId.toString()],
      },
      count: 20,
    };

    const response: ModuleProjectSearchResult[] | null = await SearchService.search(searchParams);

    if (response) {
      const moduleProjectIds = response
        .filter(
          (moduleProject) => moduleProject.cohorts?.cohortModules && moduleProject.cohorts?.cohortModules.length > 0
        )
        .map(({ id }) => Number(id));
      return moduleProjectIds;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModuleCohorts = createAsyncThunk(
  'module/cohortsAndProjects',
  async (moduleId: string, { rejectWithValue }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'modules',
      fields: [
        'cohortModules.title',
        'cohortModules.startDate',
        'cohortModules.endDate',
        'cohortModules.cohort.id',
        'cohortModules.cohort.name',
        'cohortModules.cohort.participants.id',
        'cohortModules.cohort.participants.name',
        'cohortModules.cohort.participants.projects.id',
        'cohortModules.cohort.participants.projects.name',
      ],
      search: {
        operation: 'field',
        field: 'id',
        type: 'Exact',
        values: [moduleId.toString()],
      },
      count: 20,
    };

    const response: ModuleCohortsSearchResult[] | null = await SearchService.search(searchParams);

    if (response) {
      return response[0];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestSearchModules = createAsyncThunk(
  'modules/search',
  async (request: { search?: SearchNodePayload; sortOrder?: SearchSortOrder }, { rejectWithValue }) => {
    const { search, sortOrder } = request;

    const response: ModuleSearchResult[] | null = await ModuleService.search(search, sortOrder);

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
