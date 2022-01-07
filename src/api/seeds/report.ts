import axios from '..';
import { paths } from 'src/api/types/generated-schema';
import { convertToSearchNodePayload, SeedSearchCriteria, SeedSearchSortOrder } from './search';

const EXPORT_ENDPOINT = '/api/v1/seedbank/search/export';
export type ExportRequestPayload = paths[typeof EXPORT_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ExportResponse = paths[typeof EXPORT_ENDPOINT]['post']['responses'][200]['content']['text/csv'];

export async function downloadReport(
  searchCriteria: SeedSearchCriteria,
  searchSortOrder: SeedSearchSortOrder,
  searchColumns: string[],
  facilityId: number
): Promise<string | null> {
  try {
    const params: ExportRequestPayload = {
      facilityId,
      fields: searchColumns.includes('active') ? searchColumns : [...searchColumns, 'active'],
      sortOrder: [searchSortOrder],
      search: convertToSearchNodePayload(searchCriteria),
    };

    const response: ExportResponse = (await axios.post(EXPORT_ENDPOINT, params)).data;
    return response;
  } catch {
    return null;
  }
}
