import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type SpeciesTargetForSubstratum = {
  speciesId: number;
  scientificName: string;
  commonName?: string;
  target: number;
  alreadyWithdrawn: number;
  notYetWithdrawn: number;
};

export type SpeciesTargetsForSubstratumArgs = {
  plantingSeasonId: number;
  substratumId: number;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSpeciesTargetsForSubstratum: build.query<SpeciesTargetForSubstratum[], SpeciesTargetsForSubstratumArgs>({
      // Run two searches in parallel, combine client-side: one for targets,
      // one for actual withdrawals against this season+substratum.
      queryFn: async (args, _api, _extraOptions, baseQuery) => {
        const [targetsResult, withdrawalsResult] = await Promise.all([
          baseQuery({
            url: '/api/v1/search',
            method: 'POST',
            body: {
              prefix: 'plantingSeasonSpeciesTargets',
              fields: ['species_id', 'species_scientificName', 'species_commonName', 'quantity(raw)'],
              search: {
                operation: 'and',
                children: [
                  {
                    operation: 'field',
                    field: 'plantingSeason_id',
                    type: 'Exact',
                    values: [`${args.plantingSeasonId}`],
                  },
                  {
                    operation: 'field',
                    field: 'substratum_id',
                    type: 'Exact',
                    values: [`${args.substratumId}`],
                  },
                ],
              },
              count: 0,
            },
          }),
          baseQuery({
            url: '/api/v1/search',
            method: 'POST',
            body: {
              prefix: 'batchWithdrawals',
              fields: ['batch_species_id', 'readyQuantityWithdrawn(raw)'],
              search: {
                operation: 'and',
                children: [
                  {
                    operation: 'field',
                    field: 'withdrawal_plantingSeason_id',
                    type: 'Exact',
                    values: [`${args.plantingSeasonId}`],
                  },
                  {
                    operation: 'field',
                    field: 'withdrawal_delivery_plantings_substratum_id',
                    type: 'Exact',
                    values: [`${args.substratumId}`],
                  },
                ],
              },
              count: 0,
            },
          }),
        ]);

        if (targetsResult.error) {
          return { error: targetsResult.error };
        }
        if (withdrawalsResult.error) {
          return { error: withdrawalsResult.error };
        }

        const targetsResponse = targetsResult.data as TargetsApiResponse;
        const withdrawalsResponse = withdrawalsResult.data as WithdrawalsApiResponse;

        const withdrawnBySpecies = new Map<number, number>();
        (withdrawalsResponse.results ?? []).forEach((entry) => {
          const speciesId = Number(entry.batch_species_id);
          withdrawnBySpecies.set(
            speciesId,
            (withdrawnBySpecies.get(speciesId) ?? 0) + Number(entry['readyQuantityWithdrawn(raw)'])
          );
        });

        const rows: SpeciesTargetForSubstratum[] = (targetsResponse.results ?? []).map((entry) => {
          const speciesId = Number(entry.species_id);
          const target = Number(entry['quantity(raw)']);
          const alreadyWithdrawn = withdrawnBySpecies.get(speciesId) ?? 0;
          return {
            speciesId,
            scientificName: entry.species_scientificName,
            commonName: entry.species_commonName,
            target,
            alreadyWithdrawn,
            notYetWithdrawn: Math.max(0, target - alreadyWithdrawn),
          };
        });

        return { data: rows };
      },
      providesTags: [
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
        { type: QueryTagTypes.NurseryWithdrawals, id: 'LIST' },
      ],
    }),
  }),
});

type TargetsApiResult = {
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  'quantity(raw)': string;
};

type TargetsApiResponse = {
  results: TargetsApiResult[];
};

type WithdrawalsApiResult = {
  batch_species_id: string;
  'readyQuantityWithdrawn(raw)': string;
};

type WithdrawalsApiResponse = {
  results: WithdrawalsApiResult[];
};

export const { useListSpeciesTargetsForSubstratumQuery, useLazyListSpeciesTargetsForSubstratumQuery } = injectedRtkApi;
