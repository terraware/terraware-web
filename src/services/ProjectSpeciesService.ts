import { DateTime } from 'luxon';

import { DeliverableTypeType } from 'src/types/Deliverables';
import { SpeciesDeliverable } from 'src/types/ProjectSpecies';
import { SearchRequestPayload, SearchResponseElement } from 'src/types/Search';
import { createSearchNodeForIds } from 'src/utils/search';

import SearchService from './SearchService';

const DELIVERABLES_SEARCH_FIELDS = [
  'dueDate',
  'id',
  'module_id',
  'module_projectModules_endDate',
  'module_projectModules_startDate',
  'project_id',
];

/**
 * Get species deliverables for a set of project IDs.
 */
const searchSpeciesDeliverables = async (projectIds: number[]): Promise<SpeciesDeliverable[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projectDeliverables',
    fields: DELIVERABLES_SEARCH_FIELDS,
    search: {
      operation: 'and',
      children: [
        ...createSearchNodeForIds('project.id', projectIds),
        {
          operation: 'field',
          field: 'type(raw)',
          type: 'Exact',
          values: ['Species' as DeliverableTypeType],
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

  return response.map((result: SearchResponseElement): SpeciesDeliverable => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { dueDate, id, module_id, module_projectModules_endDate, module_projectModules_startDate, project_id } =
      result;

    return {
      dueDate: DateTime.fromISO(String(dueDate)),
      id: Number(id),
      moduleStartDate: DateTime.fromISO(String(module_projectModules_startDate)),
      moduleId: Number(module_id),
      moduleEndDate: DateTime.fromISO(String(module_projectModules_endDate)),
      projectId: Number(project_id),
    };
  });
};

const ProjectSpeciesService = {
  searchSpeciesDeliverables,
};

export default ProjectSpeciesService;
