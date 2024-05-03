import { paths } from 'src/api/types/generated-schema';
import { Module } from 'src/types/Module';

import HttpService, { Response2 } from './HttpService';

export type ModulesData = {
  modules: Module[] | undefined;
};

export type ModuleData = {
  module: Module | undefined;
};

const PROJECT_MODULES_ENDPOINT = '/api/v1/projects/{projectId}/modules';

export type ListModulesResponsePayload =
  paths[typeof PROJECT_MODULES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpProjectModules = HttpService.root(PROJECT_MODULES_ENDPOINT);

/**
 * List all modules for a project
 */
const list = (projectId: number | null): Promise<Response2<ModulesData | null>> =>
  httpProjectModules.get<ListModulesResponsePayload, { data: ModulesData | undefined }>(
    {
      url: PROJECT_MODULES_ENDPOINT,
      urlReplacements: { '{projectId}': `${projectId}` },
    },
    (response) => ({
      data: {
        modules: response?.modules,
      },
    })
  );

/**
 * Get module data for a specific module / project ID.
 */
const get = async (projectId: number, moduleId: number): Promise<Response2<ModuleData | null>> => {
  // TODO this will become its own API in the BE soon.
  const _list = await list(projectId);
  if (_list && _list.requestSucceeded && _list.data?.modules) {
    const module = _list.data.modules.find((module) => module.id === moduleId);
    if (module) {
      return {
        requestSucceeded: true,
        data: {
          module: module,
        },
      };
    }
  }

  return {
    requestSucceeded: false,
  };
};

const ModuleService = {
  get,
  list,
};

export default ModuleService;
