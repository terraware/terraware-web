import { SearchNodePayload, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

import SearchService from './SearchService';

export type MatrixViewSearchParams = {
  fields: string[];
  searchCriteria?: SearchNodePayload[];
  sortOrder?: SearchSortOrder;
};

/**
 * Search projects
 */
const searchProjects = async <T extends SearchResponseElement>({
  fields,
  searchCriteria,
  sortOrder,
}: MatrixViewSearchParams): Promise<T[] | null> => {
  const newCriteria = Object.values(searchCriteria ?? {});
  const search = {
    operation: 'and',
    children: newCriteria,
  } as SearchNodePayload;

  const params: SearchRequestPayload = {
    prefix: 'projects',
    fields,
    search,
    count: 1000,
  };

  if (sortOrder) {
    params.sortOrder = [sortOrder];
  }

  return SearchService.search<T>(params);
};

/**
 * Exported functions
 */
const MatrixViewService = {
  searchProjects,
};

export default MatrixViewService;
