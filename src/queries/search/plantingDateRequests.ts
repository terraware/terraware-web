import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type PlantingDateRequestSpeciesDetail = {
  speciesId: number;
  scientificName: string;
  commonName?: string;
  requestedQuantity: number;
};

export type PlantingDateRequestSubstratumSpecies = {
  speciesId: number;
  scientificName: string;
  commonName?: string;
  quantity: number;
};

export type PlantingDateRequestSubstratum = {
  substratumId: number;
  substratumName: string;
  stratumId: number;
  stratumName: string;
  species: PlantingDateRequestSubstratumSpecies[];
};

export type PlantingDateRequestRow = {
  scheduledPlantingDateId: number;
  date: string;
  plantingSeasonId: number;
  plantingSeasonName: string;
  plantingSiteId: number;
  plantingSiteName: string;
  notes?: string;
  status: string;
  speciesNames: string[];
  speciesCount: number;
  requestedPlants: number;
  withdrawnPlants: number;
  species: PlantingDateRequestSpeciesDetail[];
  substrata: PlantingDateRequestSubstratum[];
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
              'scheduledPlantingDate_plantingSeason_plantingSite_id',
              'scheduledPlantingDate_plantingSeason_plantingSite_name',
              'date',
              'notes',
              'status',
              'plantingDateRequestSpecies.species_id',
              'plantingDateRequestSpecies.species_scientificName',
              'plantingDateRequestSpecies.species_commonName',
              'plantingDateRequestSpecies.quantity(raw)',
              'plantingDateRequestSpecies.substratum_id',
              'plantingDateRequestSpecies.substratum_name',
              'plantingDateRequestSpecies.substratum_stratum_id',
              'plantingDateRequestSpecies.substratum_stratum_name',
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
          const speciesById = new Map<number, PlantingDateRequestSpeciesDetail>();
          const substrataById = new Map<number, PlantingDateRequestSubstratum>();
          const speciesNames: string[] = [];
          let requestedPlants = 0;

          speciesEntries.forEach((entry) => {
            const speciesId = Number(entry.species_id);
            const quantity = Number(entry['quantity(raw)']);
            requestedPlants += quantity;

            // Aggregate per species (across substrata) for nursery summary
            const existing = speciesById.get(speciesId);
            if (existing) {
              existing.requestedQuantity += quantity;
            } else {
              speciesById.set(speciesId, {
                speciesId,
                scientificName: entry.species_scientificName ?? `#${speciesId}`,
                commonName: entry.species_commonName,
                requestedQuantity: quantity,
              });
              if (entry.species_scientificName) {
                speciesNames.push(entry.species_scientificName);
              }
            }

            // Group by substratum for the quantities step
            const substratumId = entry.substratum_id ? Number(entry.substratum_id) : undefined;
            if (substratumId !== undefined) {
              let substratum = substrataById.get(substratumId);
              if (!substratum) {
                substratum = {
                  substratumId,
                  substratumName: entry.substratum_name ?? '',
                  stratumId: entry.substratum_stratum_id ? Number(entry.substratum_stratum_id) : 0,
                  stratumName: entry.substratum_stratum_name ?? '',
                  species: [],
                };
                substrataById.set(substratumId, substratum);
              }
              substratum.species.push({
                speciesId,
                scientificName: entry.species_scientificName ?? `#${speciesId}`,
                commonName: entry.species_commonName,
                quantity,
              });
            }
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
            plantingSiteId: Number(result.scheduledPlantingDate_plantingSeason_plantingSite_id),
            plantingSiteName: result.scheduledPlantingDate_plantingSeason_plantingSite_name,
            notes: result.notes,
            status: result.status,
            speciesNames,
            speciesCount: speciesById.size,
            requestedPlants,
            withdrawnPlants,
            species: [...speciesById.values()],
            substrata: [...substrataById.values()].sort((a, b) =>
              (a.stratumName + a.substratumName).localeCompare(b.stratumName + b.substratumName)
            ),
          };
        }),
    }),
  }),
});

type PlantingDateRequestSpeciesApiResult = {
  species_id: string;
  species_scientificName?: string;
  species_commonName?: string;
  'quantity(raw)': string;
  substratum_id?: string;
  substratum_name?: string;
  substratum_stratum_id?: string;
  substratum_stratum_name?: string;
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
  scheduledPlantingDate_plantingSeason_plantingSite_id: string;
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
