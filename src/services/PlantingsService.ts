import SearchService from 'src/services/SearchService';
import { UpdateSubstratumPayload } from 'src/types/PlantingSite';
import { SearchCriteria, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

import HttpService, { Response } from './HttpService';

const SUBSTRATUM_ENDPOINT = '/api/v1/tracking/substrata/{id}';

const httpSubstratum = HttpService.root(SUBSTRATUM_ENDPOINT);

/**
 * List nursery withdrawals
 */
const listPlantings = async (
  organizationId: number,
  searchCriteria: SearchCriteria,
  sortOrder?: SearchSortOrder
): Promise<SearchResponseElement[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'nurseryWithdrawals',
    fields: [
      'delivery.plantings.id',
      'delivery.plantings.plantingSite.id',
      'delivery.plantings.substratum.id',
      'delivery.plantings.substratum.totalPlants(raw)',
      'delivery.plantings.delivery.withdrawal_id',
      'delivery.plantings.species.id',
      'delivery.plantings.species.scientificName',
      'delivery.plantings.species.rare',
      'delivery.plantings.species.conservationCategory',
      'delivery.plantings.createdTime',
      'delivery.plantings.numPlants(raw)',
      'delivery.plantings.type',
    ],
    search: SearchService.convertToSearchNodePayload(searchCriteria, organizationId),
    sortOrder: sortOrder ? [sortOrder] : [{ field: 'delivery.plantings.id', direction: 'Ascending' }],
    count: 1000,
  };

  return await SearchService.search(searchParams);
};

const updatePlantingCompleted = async (substratumId: number, planting: UpdateSubstratumPayload): Promise<Response> => {
  return await httpSubstratum.put({
    urlReplacements: {
      '{id}': substratumId.toString(),
    },
    entity: planting,
  });
};

/**
 * Exported functions
 */
const PlantingsService = {
  listPlantings,
  updatePlantingCompleted,
};

export default PlantingsService;
