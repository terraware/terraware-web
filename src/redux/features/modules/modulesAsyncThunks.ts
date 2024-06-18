import { createAsyncThunk } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';

import { SearchService } from 'src/services';
import ModuleService from 'src/services/ModuleService';
import strings from 'src/strings';
import { ModuleDeliverable, ModuleDeliverableSearchResult, ModuleProjectSearchResult } from 'src/types/Module';
import { SearchRequestPayload } from 'src/types/Search';

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
  async (request: { moduleId: number; projectId: number }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'projects.projectDeliverables',
      fields: ['id', 'module_id', 'project_id', 'name', 'category', 'dueDate', 'status', 'type', 'type(raw)'],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'project.id',
            type: 'Exact',
            values: [request.projectId],
          },
          {
            operation: 'field',
            field: 'module.id',
            type: 'Exact',
            values: [request.moduleId],
          },
        ],
      },
      sortOrder: [
        {
          field: 'dueDate',
        },
      ],
      count: 20,
    };

    const response = await SearchService.search(searchParams);
    const deliverableSearchResults = response ? (response as ModuleDeliverableSearchResult[]) : [];

    return deliverableSearchResults.map(
      (result) =>
        ({
          moduleId: result.module_id,
          projectId: result.project_id,
          ...result,
          dueDate: DateTime.fromISO(result.dueDate),
          module_id: undefined,
          project_id: undefined,
          type: result['type(raw)'],
        }) as ModuleDeliverable
    );
  }
);
