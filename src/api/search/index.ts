/**
 * Temporarily re-export types/functions from search service
 * until concrete services are written with high level functions
 * that abstract away the underlying search implementation
 */

import { SearchService } from 'src/services';

export type {
  AndNodePayload,
  FieldNodePayload,
  NotNodePayload,
  OrNodePayload,
  SearchNodePayload,
  FieldValuesPayload,
  SearchCriteria,
  SearchSortOrder,
  SearchRequestPayload,
  SearchResponsePayload,
  SearchResponseElement,
} from 'src/services/SearchService';

const { convertToSearchNodePayload, search, searchCsv } = SearchService;

export { convertToSearchNodePayload, search, searchCsv };
