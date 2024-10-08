import { createAsyncThunk } from '@reduxjs/toolkit';

import { SearchService } from 'src/services';
import CohortModuleService from 'src/services/CohortModuleService';
import DeliverablesService from 'src/services/DeliverablesService';
import { Response, Response2 } from 'src/services/HttpService';
import ModuleService, { GetModuleRequestParam, ListModulesRequestParam } from 'src/services/ModuleService';
import strings from 'src/strings';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import {
  ModuleCohortsAndProjectsSearchResult,
  ModuleProjectSearchResult,
  UpdateCohortModuleRequest,
} from 'src/types/Module';
import { SearchNodePayload, SearchRequestPayload } from 'src/types/Search';

export const requestGetModule = createAsyncThunk(
  'modules/get',
  async (request: GetModuleRequestParam, { rejectWithValue }) => {
    const response = await ModuleService.get(request);

    if (response !== null && response.requestSucceeded && response?.data?.module !== undefined) {
      return response.data.module;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModules = createAsyncThunk(
  'modules/list',
  async (request: ListModulesRequestParam, { rejectWithValue }) => {
    const response = await ModuleService.list(request);

    if (response !== null && response.requestSucceeded && response?.data?.modules !== undefined) {
      return response.data.modules;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

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
  }): Promise<ListDeliverablesElementWithOverdue[]> => {
    const result = await DeliverablesService.list(
      request.locale,
      {
        projectId: request.projectId,
        moduleId: request.moduleId,
      },
      request.search
    );

    return result.data ?? [];
  }
);

export const requestDeleteCohortModule = createAsyncThunk(
  'cohortModules/delete',
  async (
    request: {
      moduleId: number;
      cohortId: number;
    },
    { rejectWithValue }
  ) => {
    const { moduleId, cohortId } = request;
    const response: Response2<number> = await CohortModuleService.deleteOne(moduleId, cohortId);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteManyCohortModule = createAsyncThunk(
  'cohortModules/deleteMany',
  async (
    request: {
      modulesId: number[];
      cohortId: number;
    },
    { rejectWithValue }
  ) => {
    const { modulesId, cohortId } = request;

    const promises = modulesId.map((moduleId) => CohortModuleService.deleteOne(moduleId, cohortId));

    const results = await Promise.all(promises);

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateCohortModule = createAsyncThunk(
  'cohortModules/update',
  async (
    {
      moduleId,
      cohortId,
      request,
    }: {
      moduleId: number;
      cohortId: number;
      request: UpdateCohortModuleRequest;
    },
    { rejectWithValue }
  ) => {
    const response: Response = await CohortModuleService.update({ moduleId, cohortId, entity: request });

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateManyCohortModule = createAsyncThunk(
  'cohortModules/updateMany',
  async (
    {
      cohortId,
      requests,
    }: {
      cohortId: number;
      requests: (UpdateCohortModuleRequest & {
        moduleId: number;
      })[];
    },
    { rejectWithValue }
  ) => {
    const results = await Promise.all(
      requests.map((request) => {
        const { moduleId, ...entity } = request;
        return CohortModuleService.update({ moduleId: moduleId, cohortId, entity });
      })
    );

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModuleCohortsAndProjects = createAsyncThunk(
  'module/cohortsAndProjects',
  async (moduleId: string, { rejectWithValue }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'projects.participant.cohort.cohortModules.module',
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

    const response: ModuleCohortsAndProjectsSearchResult[] | null = await SearchService.search(searchParams);

    if (response) {
      return response[0];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
