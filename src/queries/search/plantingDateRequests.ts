import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type PlantingDateRequestRow = {
  scheduledPlantingDateId: number;
  date: string;
  plantingSeasonId: number;
  plantingSeasonName: string;
  plantingSiteName: string;
  notes?: string;
  status: string;
  speciesNames: string[];
  speciesCount: number;
  requestedPlants: number;
  withdrawnPlants: number;
};

export type ListPlantingDateRequestsArgs = {
  organizationId: number;
  plantingSiteId?: number;
  plantingSeasonId?: number;
  speciesId?: number;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPlantingDateRequests: build.query<PlantingDateRequestRow[], ListPlantingDateRequestsArgs>({
      query: (args) => {
        const filters: Record<string, unknown>[] = [
          {
            operation: 'field',
            field: 'scheduledPlantingDate_plantingSeason_plantingSite_organization_id',
            type: 'Exact',
            values: [`${args.organizationId}`],
          },
        ];
        if (args.plantingSiteId) {
          filters.push({
            operation: 'field',
            field: 'scheduledPlantingDate_plantingSeason_plantingSite_id',
            type: 'Exact',
            values: [`${args.plantingSiteId}`],
          });
        }
        if (args.plantingSeasonId) {
          filters.push({
            operation: 'field',
            field: 'scheduledPlantingDate_plantingSeason_id',
            type: 'Exact',
            values: [`${args.plantingSeasonId}`],
          });
        }
        if (args.speciesId) {
          filters.push({
            operation: 'field',
            field: 'plantingDateRequestSpecies.species_id',
            type: 'Exact',
            values: [`${args.speciesId}`],
          });
        }
        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'plantingDateRequests',
            fields: [
              'scheduledPlantingDate_plantingSeason_id',
              'scheduledPlantingDate_plantingSeason_name',
              'scheduledPlantingDate_plantingSeason_plantingSite_name',
              'date',
              'notes',
              'status',
              'plantingDateRequestSpecies.species_id',
              'plantingDateRequestSpecies.species_scientificName',
              'plantingDateRequestSpecies.quantity(raw)',
              'withdrawals.batchWithdrawals_batch_species_id',
              'withdrawals.batchWithdrawals_readyQuantityWithdrawn(raw)',
            ],
            search: {
              operation: 'and',
              children: filters,
            },
            sortOrder: [{ field: 'date', direction: 'Ascending' }],
            count: 0,
          },
        };
      },
      providesTags: [{ type: QueryTagTypes.PlantingSeasonDates, id: 'REQUESTS' }],
      transformResponse: (response: PlantingDateRequestsApiResponse): PlantingDateRequestRow[] =>
        response.results.map((result): PlantingDateRequestRow => {
          const speciesEntries = result.plantingDateRequestSpecies ?? [];
          const speciesIdSet = new Set<number>();
          const speciesNames: string[] = [];
          let requestedPlants = 0;
          speciesEntries.forEach((entry) => {
            const speciesId = Number(entry.species_id);
            if (!speciesIdSet.has(speciesId)) {
              speciesIdSet.add(speciesId);
              if (entry.species_scientificName) {
                speciesNames.push(entry.species_scientificName);
              }
            }
            requestedPlants += Number(entry['quantity(raw)']);
          });

          const withdrawnPlants = (result.withdrawals ?? []).reduce(
            (sum, entry) => sum + Number(entry['batchWithdrawals_readyQuantityWithdrawn(raw)']),
            0
          );

          return {
            scheduledPlantingDateId: Number(result.scheduledPlantingDate_id ?? result.id),
            date: result.date,
            plantingSeasonId: Number(result.scheduledPlantingDate_plantingSeason_id),
            plantingSeasonName: result.scheduledPlantingDate_plantingSeason_name,
            plantingSiteName: result.scheduledPlantingDate_plantingSeason_plantingSite_name,
            notes: result.notes,
            status: result.status,
            speciesNames,
            speciesCount: speciesIdSet.size,
            requestedPlants,
            withdrawnPlants,
          };
        }),
    }),
  }),
});

type PlantingDateRequestSpeciesApiResult = {
  species_id: string;
  species_scientificName?: string;
  'quantity(raw)': string;
};

type PlantingDateRequestWithdrawalApiResult = {
  batchWithdrawals_batch_species_id?: string;
  'batchWithdrawals_readyQuantityWithdrawn(raw)': string;
};

type PlantingDateRequestApiResult = {
  id: string;
  scheduledPlantingDate_id?: string;
  scheduledPlantingDate_plantingSeason_id: string;
  scheduledPlantingDate_plantingSeason_name: string;
  scheduledPlantingDate_plantingSeason_plantingSite_name: string;
  date: string;
  notes?: string;
  status: string;
  plantingDateRequestSpecies?: PlantingDateRequestSpeciesApiResult[];
  withdrawals?: PlantingDateRequestWithdrawalApiResult[];
};

type PlantingDateRequestsApiResponse = {
  results: PlantingDateRequestApiResult[];
};

export const { useListPlantingDateRequestsQuery, useLazyListPlantingDateRequestsQuery } = injectedRtkApi;
