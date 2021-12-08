import axios from '..';
import { paths } from 'src/api/types/generated-schema';
import { convertToSearchNodePayload, SearchField, SeedSearchCriteria, SeedSearchSortOrder } from './search';

const REPORT_ENDPOINT = '/api/v1/seedbank/search/export';
export type ExportRequestPayload = paths[typeof REPORT_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ExportResponse = paths[typeof REPORT_ENDPOINT]['post']['responses'][200]['content']['text/csv'];

export async function downloadReport(
  searchCriteria: SeedSearchCriteria,
  searchSortOrder: SeedSearchSortOrder,
  searchColumns: SearchField[],
  facilityId: number
): Promise<string | null> {
  try {
    const params: ExportRequestPayload = {
      facilityId,
      fields: searchColumns.includes('active') ? searchColumns : [...searchColumns, 'active'],
      sortOrder: [searchSortOrder],
      search: convertToSearchNodePayload(searchCriteria),
    };

    const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${REPORT_ENDPOINT}`;
    const response: ExportResponse = (await axios.post(endpoint, params)).data;
    return response;
  } catch {
    return null;
  }
}
