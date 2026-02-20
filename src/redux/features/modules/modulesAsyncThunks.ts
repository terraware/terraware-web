import { createAsyncThunk } from '@reduxjs/toolkit';

import { SearchService } from 'src/services';
import ModuleService from 'src/services/ModuleService';
import strings from 'src/strings';
import { ModuleProjectSearchResult, ModuleProjectsSearchResult, ModuleSearchResult } from 'src/types/Module';
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

export const requestListOrgProjectsAndModules = createAsyncThunk(
  'modules/listProjectModules',
  async (organizationId: number, { rejectWithValue }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'projects',
      fields: ['id', 'projectModules.module_id'],
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
        .filter((moduleProject) => moduleProject.projectModules && moduleProject.projectModules.length > 0)
        .map(({ id }) => Number(id));
      return moduleProjectIds;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModuleProjects = createAsyncThunk(
  'module/projects',
  async (moduleId: string, { rejectWithValue }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'modules',
      fields: [
        'projectModules.title',
        'projectModules.startDate',
        'projectModules.endDate',
        'projectModules.project_id',
        'projectModules.project_name',
      ],
      search: {
        operation: 'field',
        field: 'id',
        type: 'Exact',
        values: [moduleId.toString()],
      },
      count: 20,
    };

    const response: ModuleProjectsSearchResult[] | null = await SearchService.search(searchParams);

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
