import { paths } from 'src/api/types/generated-schema';
import { ModuleSearchResult } from 'src/types/Module';
import { SearchNodePayload, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

import HttpService, { Response2 } from './HttpService';
import SearchService from './SearchService';

const MODULES_ENDOINT = '/api/v1/accelerator/modules';
const MODULE_ENDOINT = '/api/v1/accelerator/modules/{moduleId}';
const MODULES_IMPORT_ENDPOINT = '/api/v1/accelerator/modules/import';

export type ListModulesResponsePayload =
  paths[typeof MODULES_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type GetModuleResponsePayload =
  paths[typeof MODULE_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type ImportModuleResponsePayload =
  paths[typeof MODULES_IMPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

/**
 * List all modules
 */
const list = (): Promise<Response2<ListModulesResponsePayload>> => {
  return HttpService.root(MODULES_ENDOINT).get2<ListModulesResponsePayload>();
};

/**
 * Get module data
 */
const get = async (moduleId: number): Promise<Response2<GetModuleResponsePayload>> => {
  return HttpService.root(MODULE_ENDOINT).get2<GetModuleResponsePayload>({
    urlReplacements: { '{moduleId}': `${moduleId}` },
  });
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
  searchPayload?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ModuleSearchResult[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'modules',
    fields: ['id', 'name', 'projectModules.project_id', 'deliverables.id'],
    search: searchPayload ?? { operation: 'and', children: [] },
    sortOrder: [sortOrder ?? { field: 'name' }],
    count: 0,
  };

  const response: SearchResponseElement[] | null = await SearchService.search(searchParams);

  if (!response) {
    return null;
  }

  return response.map((result: SearchResponseElement) => {
    const { id, name, projectModules, deliverables } = result;

    return {
      id,
      name,
      projectsQuantity: Array.isArray(projectModules) ? projectModules.length : 0,
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
