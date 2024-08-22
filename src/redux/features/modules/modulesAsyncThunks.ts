import { createAsyncThunk } from '@reduxjs/toolkit';

import { SearchService } from 'src/services';
import DeliverablesService from 'src/services/DeliverablesService';
import ModuleService from 'src/services/ModuleService';
import strings from 'src/strings';
import { ListDeliverablesElement } from 'src/types/Deliverables';
import { ModuleProjectSearchResult } from 'src/types/Module';
import { SearchNodePayload, SearchRequestPayload } from 'src/types/Search';

export const requestGetModule = createAsyncThunk(
  'modules/get',
  async ({ moduleId, projectId }: { moduleId: number; projectId: number }, { rejectWithValue }) => {
    const response = await ModuleService.get(projectId, moduleId);

    if (response !== null && response.requestSucceeded && response?.data?.module !== undefined) {
      return response.data.module;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModules = createAsyncThunk('modules/list', async (projectId: number, { rejectWithValue }) => {
  const response = await ModuleService.list(projectId);

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
      fields: ['id', 'participant.cohort.cohortModules.module_id'],
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
          (moduleProject) =>
            moduleProject.participant?.cohort?.cohortModules &&
            moduleProject.participant?.cohort?.cohortModules.length > 0
        )
        .map(({ id }) => Number(id));
      return moduleProjectIds;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModuleDeliverables = createAsyncThunk(
  'modules/deliverables',
  async (request: {
    locale: string | null;
    moduleId: number;
    projectId: number;
    search?: SearchNodePayload;
  }): Promise<ListDeliverablesElement[]> => {
    const result = await DeliverablesService.list(
      request.locale,
      {
        projectId: request.projectId,
        moduleId: request.moduleId,
      },
      request.search
    );

    return result?.deliverables ?? [];
  }
);
