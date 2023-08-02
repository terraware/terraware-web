import { SearchCriteria, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import SearchService, { SearchRequestPayload } from 'src/services/SearchService';
import HttpService, { Response } from './HttpService';
import { UpdatePlantingSubzonePayload } from 'src/types/PlantingSite';

const PLANTING_SUBZONE_ENDPOINT = '/api/v1/tracking/subzones/{id}';

const httpPlantingSubzone = HttpService.root(PLANTING_SUBZONE_ENDPOINT);

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
      'delivery.plantings.plantingSubzone.id',
      'delivery.plantings.plantingSubzone.totalPlants',
      'delivery.plantings.delivery.withdrawal_id',
      'delivery.plantings.species.id',
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

const updatePlantingCompleted = async (
  subzoneId: number,
  planting: UpdatePlantingSubzonePayload
): Promise<Response> => {
  return await httpPlantingSubzone.put({
    urlReplacements: {
      '{id}': subzoneId.toString(),
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
