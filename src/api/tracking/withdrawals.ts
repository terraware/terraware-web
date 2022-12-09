import axios from '../';
import { addError } from '../utils';
import { paths } from 'src/api/types/generated-schema';
import {
  SearchCriteria,
  SearchRequestPayload,
  SearchResponseElement,
  convertToSearchNodePayload,
  search,
} from 'src/api/search';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Delivery } from 'src/api/types/tracking';

/**
 * List nursery withdrawals
 */
export async function listNurseryWithdrawals(
  organizationId: number,
  searchCriteria: SearchCriteria,
  count = 1000
): Promise<SearchResponseElement[] | null> {
  const searchParams: SearchRequestPayload = {
    prefix: 'nurseryWithdrawals',
    fields: [
      'id',
      'delivery_id',
      'withdrawnDate',
      'purpose',
      'facility_name',
      'destinationName',
      'plotNames',
      'batchWithdrawals.batch_species_scientificName',
      'totalWithdrawn',
      'hasReassignments',
    ],
    search: convertToSearchNodePayload(searchCriteria, organizationId),
    sortOrder: [{ field: 'id', direction: 'Ascending' }],
    count,
  };

  const data = await search(searchParams);
  if (data) {
    return data.map((datum) => {
      const { batchWithdrawals, ...remaining } = datum;
      const speciesScientificNames = (batchWithdrawals as any[]).map(
        (batchWithdrawal) => batchWithdrawal.batch_species_scientificName
      );
      // replace batchWithdrawals with species_scientificNames, which is an array of species names
      const deDupedNames = new Set(speciesScientificNames);
      return {
        ...remaining,
        speciesScientificNames: Array.from(deDupedNames).sort(),
      };
    });
  }
  return null;
}

/**
 * Check if an org has nursery withdrawals
 */
export async function hasNurseryWithdrawals(organizationId: number): Promise<boolean> {
  const response = await listNurseryWithdrawals(organizationId, [], 1);
  return response !== null && response !== undefined && response.length > 0;
}

/**
 * Get a nursery withdrawal by id
 */

const NURSERY_WITHDRAWAL_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}';

type GetNurseryWithdrawalResponsePayload =
  paths[typeof NURSERY_WITHDRAWAL_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type NurseryWithdrawalResponse = {
  requestSucceeded: boolean;
  withdrawal?: NurseryWithdrawal;
  delivery?: Delivery;
  batches?: Batch[];
  error?: string;
};

export const getNurseryWithdrawal = async (withdrawalId: string): Promise<NurseryWithdrawalResponse> => {
  const response: NurseryWithdrawalResponse = {
    requestSucceeded: true,
  };

  try {
    const endpoint = NURSERY_WITHDRAWAL_ENDPOINT.replace('{withdrawalId}', withdrawalId);
    const serverResponse: GetNurseryWithdrawalResponsePayload = (await axios.get(endpoint)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    } else {
      response.withdrawal = serverResponse.withdrawal;
      response.batches = serverResponse.batches;
      response.delivery = serverResponse.delivery;
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};
