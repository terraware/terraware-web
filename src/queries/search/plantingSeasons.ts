import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlantingSeasonSpeciesSummary: build.query<PlantingSeasonSpeciesSummaryRow[], number>({
      query: (plantingSeasonId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'plantingSeasons',
          fields: [
            'id',
            'name',
            'speciesTargets.species_id',
            'speciesTargets.species_scientificName',
            'speciesTargets.species_commonName',
            'speciesTargets.quantity(raw)',
            'speciesTargets.substratum_name',
            'allocatedSpecies.species_id',
            'allocatedSpecies.quantity(raw)',
            'withdrawals.batchWithdrawals_readyQuantityWithdrawn(raw)',
            'withdrawals.batchWithdrawals_batch_species_id',
          ],
          search: {
            operation: 'field',
            field: 'id',
            type: 'Exact',
            values: [`${plantingSeasonId}`],
          },
          sortOrder: [{ field: 'name', direction: 'Ascending' }],
          count: 0,
        },
      }),
      providesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasons, id: `${plantingSeasonId}-summary` },
      ],
      transformResponse: (response: PlantingSeasonSummaryApiResponse): PlantingSeasonSpeciesSummaryRow[] => {
        const season = response.results[0];
        if (!season) {
          return [];
        }

        const speciesInfoById = new Map<number, { scientificName?: string; commonName?: string }>();
        const targetBySpecies = new Map<number, number>();
        (season.speciesTargets ?? []).forEach((entry) => {
          const speciesId = Number(entry.species_id);
          targetBySpecies.set(speciesId, (targetBySpecies.get(speciesId) ?? 0) + Number(entry['quantity(raw)']));
          if (!speciesInfoById.has(speciesId)) {
            speciesInfoById.set(speciesId, {
              scientificName: entry.species_scientificName,
              commonName: entry.species_commonName,
            });
          }
        });

        const allocatedBySpecies = new Map<number, number>();
        (season.allocatedSpecies ?? []).forEach((entry) => {
          allocatedBySpecies.set(Number(entry.species_id), Number(entry['quantity(raw)']));
        });

        const withdrawnBySpecies = new Map<number, number>();
        (season.withdrawals ?? []).forEach((entry) => {
          const speciesId = Number(entry.batchWithdrawals_batch_species_id);
          withdrawnBySpecies.set(
            speciesId,
            (withdrawnBySpecies.get(speciesId) ?? 0) + Number(entry['batchWithdrawals_readyQuantityWithdrawn(raw)'])
          );
        });

        const speciesIds = new Set<number>([...targetBySpecies.keys(), ...withdrawnBySpecies.keys()]);

        return [...speciesIds].map((speciesId) => {
          const target = targetBySpecies.get(speciesId) ?? 0;
          const withdrawn = withdrawnBySpecies.get(speciesId) ?? 0;
          const info = speciesInfoById.get(speciesId) ?? {};
          return {
            speciesId,
            scientificName: info.scientificName,
            commonName: info.commonName,
            target,
            allocated: allocatedBySpecies.get(speciesId) ?? 0,
            withdrawn,
            leftToPlant: Math.max(0, target - withdrawn),
          };
        });
      },
    }),
  }),
});

type PlantingSeasonSpeciesTargetResult = {
  species_id: string;
  species_scientificName?: string;
  species_commonName?: string;
  'quantity(raw)': string;
  substratum_name?: string;
};

type PlantingSeasonAllocatedSpeciesResult = {
  species_id: string;
  'quantity(raw)': string;
};

type PlantingSeasonWithdrawalResult = {
  'batchWithdrawals_readyQuantityWithdrawn(raw)': string;
  batchWithdrawals_batch_species_id: string;
};

type PlantingSeasonSummaryApiResult = {
  id: string;
  name: string;
  speciesTargets?: PlantingSeasonSpeciesTargetResult[];
  allocatedSpecies?: PlantingSeasonAllocatedSpeciesResult[];
  withdrawals?: PlantingSeasonWithdrawalResult[];
};

type PlantingSeasonSummaryApiResponse = {
  results: PlantingSeasonSummaryApiResult[];
};

export type PlantingSeasonSpeciesSummaryRow = {
  speciesId: number;
  scientificName?: string;
  commonName?: string;
  target: number;
  allocated: number;
  withdrawn: number;
  leftToPlant: number;
};

export const { useGetPlantingSeasonSpeciesSummaryQuery, useLazyGetPlantingSeasonSpeciesSummaryQuery } = injectedRtkApi;
