import { DeliverableCategoryType, DeliverableStatusType, DeliverableTypeType } from 'src/types/Deliverables';
import { ModuleEventStatus, ModuleEventType } from 'src/types/Module';
import { SearchRequestPayload, SearchResponseElement } from 'src/types/Search';

import SearchService from './SearchService';

export type DeliverableSearchResultType = {
  id: number;
  moduleId: number;
  moduleName: string;
  projectId: number;
  category: DeliverableCategoryType;
  categoryDisplayName: string;
  dueDate: string;
  name: string;
  position: number;
  status: DeliverableStatusType | null;
  statusDisplayName: string | null;
  type: DeliverableTypeType;
  typeDisplayName: string;
};

export type EventSearchResultType = {
  id: number;
  moduleId: number;
  moduleName: string;
  projectId: number;
  startTime: string;
  status: ModuleEventStatus;
  statusDisplayName: string;
  type: ModuleEventType;
  typeDisplayName: string;
};

const searchDeliverables = async (projectId: number): Promise<DeliverableSearchResultType[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.projectDeliverables',
    fields: [
      'id',
      'module_id',
      'module_name',
      'project_id',
      'name',
      'description',
      'dueDate',
      'status',
      'status(raw)',
      'type',
      'type(raw)',
      'category',
      'position',
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
          field: 'status',
          type: 'Exact',
          values: [null, 'Not Submitted', 'Rejected'],
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

  return response.map((result: SearchResponseElement): DeliverableSearchResultType => {
    const { id, module_id, module_name, project_id, name, dueDate, status, type, category, position } = result;

    return {
      id: Number(id),
      moduleId: Number(module_id),
      moduleName: String(module_name),
      projectId: Number(project_id),
      name: String(name),
      dueDate: String(dueDate),
      status: result['status(raw)'] ? (result['status(raw)'] as DeliverableStatusType) : null,
      statusDisplayName: String(status),
      type: result['type(raw)'] as DeliverableTypeType,
      typeDisplayName: String(type),
      category: result['category(raw)'] as DeliverableCategoryType,
      categoryDisplayName: String(category),
      position: Number(position),
    };
  });
};

const searchEvents = async (projectId: number): Promise<EventSearchResultType[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.events',
    fields: [
      'id',
      'module_id',
      'module_name',
      'projects_id',
      'startTime',
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
          field: 'projects.id',
          type: 'Exact',
          values: [projectId],
        },
        {
          operation: 'field',
          field: 'status',
          type: 'Exact',
          values: ['In Progress', 'Not Started', 'Starting Soon'],
        },
      ],
    },
    sortOrder: [
      {
        field: 'startTime',
      },
    ],
    count: 50,
  };

  const response: SearchResponseElement[] | null = await SearchService.search(searchParams);

  if (!response) {
    return null;
  }

  return response.map((result: SearchResponseElement): EventSearchResultType => {
    const { id, module_id, module_name, projects_id, startTime, status, type } = result;

    return {
      id: Number(id),
      moduleId: Number(module_id),
      moduleName: String(module_name),
      projectId: Number(projects_id),
      startTime: String(startTime),
      status: result['status(raw)'] as ModuleEventStatus,
      statusDisplayName: String(status),
      type: result['type(raw)'] as ModuleEventType,
      typeDisplayName: String(type),
    };
  });
};

/**
 * Exported functions
 */
const ToDoService = {
  searchDeliverables,
  searchEvents,
};

export default ToDoService;
