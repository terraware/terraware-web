import { paths } from 'src/api/types/generated-schema';
import { Module, ModuleSearchResult } from 'src/types/Module';
import { SearchNodePayload, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

import HttpService, { Response2 } from './HttpService';
import SearchService from './SearchService';

export type ModulesData = {
  modules: Module[] | undefined;
};

export type ModuleData = {
  module: Module | undefined;
};

const MODULES_ENDOINT = '/api/v1/accelerator/modules';
const MODULE_ENDOINT = '/api/v1/accelerator/modules/{moduleId}';
const MODULES_IMPORT_ENDPOINT = '/api/v1/accelerator/modules/import';

export type ListModulesResponsePayload =
  paths[typeof MODULES_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type GetModuleResponsePayload =
  paths[typeof MODULE_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type ImportModuleResponsePayload =
  paths[typeof MODULES_IMPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ListModulesRequestParam = {
  projectId?: number;
  participantId?: number;
  cohortId?: number;
};

export type GetModuleRequestParam = {
  projectId?: number;
  participantId?: number;
  cohortId?: number;
  moduleId: number;
};

/**
 * List all modules
 */
const list = ({
  projectId,
  cohortId,
  participantId,
}: ListModulesRequestParam): Promise<Response2<ModulesData | null>> => {
  const params: Record<string, string> = {};
  if (projectId) {
    params.projectId = `${projectId}`;
  }

  if (participantId) {
    params.participantId = `${participantId}`;
  }

  if (cohortId) {
    params.cohortId = `${cohortId}`;
  }

  return HttpService.root(MODULES_ENDOINT).get<ListModulesResponsePayload, { data: ModulesData | undefined }>(
    {
      params,
    },
    (response) => ({
      data: {
        modules: response?.modules,
      },
    })
  );
};

/**
 * Get module data
 */
const get = async ({
  projectId,
  cohortId,
  participantId,
  moduleId,
}: GetModuleRequestParam): Promise<Response2<ModuleData | null>> => {
  const params: Record<string, string> = {};
  if (projectId) {
    params.projectId = `${projectId}`;
  }

  if (participantId) {
    params.participantId = `${participantId}`;
  }

  if (cohortId) {
    params.cohortId = `${cohortId}`;
  }

  return HttpService.root(MODULE_ENDOINT).get<GetModuleResponsePayload, { data: ModuleData | undefined }>(
    {
      params,
      urlReplacements: { '{moduleId}': `${moduleId}` },
    },
    (response) => ({
      data: {
        module: response?.module,
      },
    })
  );
};

/**
 * import modules
 */
const importModules = async (file: File): Promise<ImportModuleResponsePayload> => {
  const entity = new FormData();
  entity.append('file', file);
  const headers = { 'content-type': 'multipart/form-data' };

  const serverResponse = await HttpService.root(MODULES_IMPORT_ENDPOINT).post({
    entity,
    headers,
  });

  return serverResponse.data;
};

const search = async (
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ModuleSearchResult[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.participant.cohort.cohortModules.module',
    fields: ['id', 'name', 'cohortModules.cohort_id', 'deliverables.id'],
    search: search ?? { operation: 'and', children: [] },
    sortOrder: [sortOrder ?? { field: 'name' }],
    count: 0,
  };

  const response: SearchResponseElement[] | null = await SearchService.search(searchParams);

  if (!response) {
    return null;
  }

  return response.map((result: SearchResponseElement) => {
    const { id, name, cohortModules, deliverables } = result;

    return {
      id,
      name,
      cohortsQuantity: Array.isArray(cohortModules) ? cohortModules.length : 0,
      deliverablesQuantity: Array.isArray(deliverables) ? deliverables.length : 0,
    } as ModuleSearchResult;
  });
};

const ModuleService = {
  get,
  list,
  importModules,
  search,
};

export default ModuleService;
