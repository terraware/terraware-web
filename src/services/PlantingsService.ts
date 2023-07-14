import { SearchCriteria, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import SearchService, { SearchRequestPayload } from 'src/services/SearchService';

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
      'delivery.plantings.delivery.withdrawal_id',
      'delivery.plantings.species.id',
      'delivery.plantings.createdTime',
      'delivery.plantings.numPlants(raw)',
      'delivery.plantings.type',
      'delivery.plantings.plantingSubzone.totalPlants',
    ],
    search: SearchService.convertToSearchNodePayload(searchCriteria, organizationId),
    sortOrder: sortOrder ? [sortOrder] : [{ field: 'delivery.plantings.id', direction: 'Ascending' }],
    count: 1000,
  };

  return await SearchService.search(searchParams);
};

/**
 * Exported functions
 */
const PlantingsService = {
  listPlantings,
};

export default PlantingsService;
