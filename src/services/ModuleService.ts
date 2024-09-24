import { paths } from 'src/api/types/generated-schema';
import { Module } from 'src/types/Module';

import HttpService, { Response2 } from './HttpService';

export type ModulesData = {
  modules: Module[] | undefined;
};

export type ModuleData = {
  module: Module | undefined;
};

const MODULES_ENDOINT = '/api/v1/accelerator/modules';
const MODULE_ENDOINT = '/api/v1/accelerator/modules/{moduleId}';

export type ListModulesResponsePayload =
  paths[typeof MODULES_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type GetModuleResponsePayload =
  paths[typeof MODULE_ENDOINT]['get']['responses'][200]['content']['application/json'];

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

const ModuleService = {
  get,
  list,
};

export default ModuleService;
