import { paths } from 'src/api/types/generated-schema';
import { DeliverableCategoryType, DeliverableStatusType, DeliverableTypeType } from 'src/types/Deliverables';
import { Module } from 'src/types/Module';
import { SearchRequestPayload, SearchResponseElement } from 'src/types/Search';

import HttpService, { Response2 } from './HttpService';
import SearchService from './SearchService';

export type ModulesData = {
  modules: Module[] | undefined;
};

export type ModuleData = {
  module: Module | undefined;
};

export type ModuleDeliverableSearchResult = {
  id: number;
  moduleId: number;
  projectId: number;
  name: string;
  category: DeliverableCategoryType;
  categoryDisplayName: string;
  dueDate: string;
  status: DeliverableStatusType;
  statusDisplayName: string;
  type: DeliverableTypeType;
  typeDisplayName: string;
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

/**
 * Get module deliverables for a specific module / project ID.
 */
const searchDeliverables = async (
  projectId: number,
  moduleId: number
): Promise<ModuleDeliverableSearchResult[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.projectDeliverables',
    fields: [
      'id',
      'module_id',
      'project_id',
      'name',
      'category',
      'category(raw)',
      'dueDate',
      'status',
      'status(raw)',
      'type',
      'type(raw)',
    ],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'project.id',
          type: 'Exact',
          values: [projectId],
        },
        {
          operation: 'field',
          field: 'module.id',
          type: 'Exact',
          values: [moduleId],
        },
      ],
    },
    sortOrder: [
      {
        field: 'dueDate',
      },
    ],
    count: 50,
  };

  const response: SearchResponseElement[] | null = await SearchService.search(searchParams);

  if (!response) {
    return null;
  }

  return response.map((result: SearchResponseElement): ModuleDeliverableSearchResult => {
    const { id, module_id, project_id, name, category, dueDate, status, type } = result;

    return {
      id: Number(id),
      moduleId: Number(module_id),
      projectId: Number(project_id),
      name: String(name),
      category: result['category(raw)'] as DeliverableCategoryType,
      categoryDisplayName: String(category),
      dueDate: String(dueDate),
      status: result['status(raw)'] as DeliverableStatusType,
      statusDisplayName: String(status),
      type: result['type(raw)'] as DeliverableTypeType,
      typeDisplayName: String(type),
    };
  });
};

const ModuleService = {
  get,
  list,
  searchDeliverables,
};

export default ModuleService;
