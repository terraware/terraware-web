import {
  PrefixedSearch,
  SearchNodePayload,
  SearchRequestPayloadWithOptionalSearch,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';

import SearchService from './SearchService';

export type MatrixViewSearchParams = {
  fields: string[];
  search?: SearchNodePayload;
  filters?: PrefixedSearch[];
  sortOrder?: SearchSortOrder;
};

/**
 * Search projects
 */
const searchProjects = async <T extends SearchResponseElement>({
  fields,
  filters,
  search,
  sortOrder,
}: MatrixViewSearchParams): Promise<T[] | null> => {
  const params: SearchRequestPayloadWithOptionalSearch = {
    prefix: 'projects',
    fields,
    filters,
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
