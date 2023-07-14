import { SearchCriteria, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import SearchService, { SearchRequestPayload } from 'src/services/SearchService';
import HttpService, { Response } from './HttpService';
import { paths } from 'src/api/types/generated-schema';
import { PlantingSiteReportedPlants } from 'src/types/PlantingSite';

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
    ],
    search: SearchService.convertToSearchNodePayload(searchCriteria, organizationId),
    sortOrder: sortOrder ? [sortOrder] : [{ field: 'delivery.plantings.id', direction: 'Ascending' }],
    count: 1000,
  };

  return await SearchService.search(searchParams);
};

const PLANTING_SITE_REPORTED_PLANTS_ENDPOINT = '/api/v1/tracking/sites/{id}/reportedPlants';

type PlantingSiteReportedPlantsResponsePayload =
  paths[typeof PLANTING_SITE_REPORTED_PLANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported response type
 */
export type PlantingSiteReportedPlantData = {
  site?: PlantingSiteReportedPlants;
};

const httpPlantingSiteReportedPlants = HttpService.root(PLANTING_SITE_REPORTED_PLANTS_ENDPOINT);

const listPlantingSiteReportedPlants = async (
  plantingSiteId: number
): Promise<PlantingSiteReportedPlantData & Response> => {
  const response: PlantingSiteReportedPlantData & Response = await httpPlantingSiteReportedPlants.get<
    PlantingSiteReportedPlantsResponsePayload,
    PlantingSiteReportedPlantData
  >(
    {
      params: {
        plantingSiteId: plantingSiteId.toString(),
      },
    },
    (data) => ({ site: data?.site })
  );

  return response;
};

/**
 * Exported functions
 */
const PlantingsService = {
  listPlantings,
  listPlantingSiteReportedPlants,
};

export default PlantingsService;
