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
const MODULES_IMPORT_ENDPOINT = '/api/v1/accelerator/modules/import';

export type ListModulesResponsePayload =
  paths[typeof MODULES_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type GetModuleResponsePayload =
  paths[typeof MODULE_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type ImportModuleResponsePayload =
  paths[typeof MODULES_IMPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ImportProblemElement = {
  problem: string;
  row: number;
};

export type ImportResponsePayload = Omit<ImportModuleResponsePayload, 'problems'> & {
  problems: ImportProblemElement[];
};

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
const importModules = async (file: File): Promise<ImportResponsePayload> => {
  const entity = new FormData();
  entity.append('file', file);
  const headers = { 'content-type': 'multipart/form-data' };

  const serverResponse = await HttpService.root(MODULES_IMPORT_ENDPOINT).post({
    entity,
    headers,
  });

  return serverResponse.data;
};

const ModuleService = {
  get,
  list,
  importModules,
};

export default ModuleService;
