import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type InventoryPlanningArgs = {
  organizationId: number;
  plantingSiteId?: number;
  plantingSeasonId?: number;
  speciesId?: number;
};

export type PlantingSeasonStatus = 'Active' | 'Upcoming' | 'Past End Date' | 'Closed';
export const inventoryPlanningPlantingSeasonStatuses: PlantingSeasonStatus[] = ['Active', 'Upcoming'];

export type InventoryPlanningSeasonRow = {
  plantingSeasonId: number;
  plantingSeasonName: string;
  plantingSiteId: number;
  plantingSiteName: string;
  startDate: string;
  endDate: string;
  status: PlantingSeasonStatus;
  target: number;
  allocated: number;
};

export type InventoryPlanningSpeciesRow = {
  speciesId: number;
  scientificName: string;
  commonName?: string;
  available: number;
  target: number;
  allocated: number;
  seasons: InventoryPlanningSeasonRow[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listInventoryPlanningSeasons: build.query<InventoryPlanningSeasonSearch[], InventoryPlanningArgs>({
      query: (args) => {
        const filters = [
          {
            operation: 'field',
            field: 'plantingSite_organization_id',
            values: [`${args.organizationId}`],
          },
          {
            operation: 'field',
            field: 'status',
            values: inventoryPlanningPlantingSeasonStatuses,
          },
        ];
        if (args.plantingSiteId) {
          filters.push({
            operation: 'field',
            field: 'plantingSite_id',
            values: [`${args.plantingSiteId}`],
          });
        }
        if (args.plantingSeasonId) {
          filters.push({
            operation: 'field',
            field: 'id',
            values: [`${args.plantingSeasonId}`],
          });
        }
        if (args.speciesId) {
          filters.push({
            operation: 'field',
            field: 'speciesTargets.species_id',
            values: [`${args.speciesId}`],
          });
        }
        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'plantingSeasons',
            fields: [
              'id',
              'name',
              'startDate',
              'endDate',
              'status',
              'plantingSite_id',
              'plantingSite_name',
              'speciesTargets.species_id',
              'speciesTargets.species_scientificName',
              'speciesTargets.species_commonName',
              'speciesTargets.quantity(raw)',
              'allocatedSpecies.species_id',
              'allocatedSpecies.quantity(raw)',
            ],
            search: {
              operation: 'and',
              children: filters,
            },
            sortOrder: [{ field: 'startDate', direction: 'Ascending' }],
            count: 0,
          },
        };
      },
      providesTags: [
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
      ],
      transformResponse: (response: InventoryPlanningSeasonSearchResponse) => response.results,
    }),

    listInventoryPlanningSpeciesAvailable: build.query<Map<number, number>, number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'species',
          fields: [
            'id',
            'scientificName',
            'commonName',
            'inventory.hardeningOffQuantity(raw)',
            'inventory.readyQuantity(raw)',
          ],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'organization_id',
                values: [`${organizationId}`],
              },
              {
                operation: 'not',
                child: {
                  operation: 'field',
                  field: 'batches.id',
                  values: [null],
                },
              },
            ],
          },
          count: 0,
        },
      }),
      providesTags: [{ type: QueryTagTypes.InventoryPlanning, id: 'LIST' }],
      transformResponse: (response: InventoryPlanningAvailableResponse): Map<number, number> => {
        const map = new Map<number, number>();
        response.results.forEach((s) => {
          const hardening = Number(s.inventory?.['hardeningOffQuantity(raw)'] ?? 0);
          const ready = Number(s.inventory?.['readyQuantity(raw)'] ?? 0);
          map.set(Number(s.id), hardening + ready);
        });
        return map;
      },
    }),
  }),
});

type InventoryPlanningSpeciesTargetSearch = {
  species_id: string;
  species_scientificName?: string;
  species_commonName?: string;
  'quantity(raw)': string;
};

type InventoryPlanningAllocatedSpeciesSearch = {
  species_id: string;
  'quantity(raw)': string;
};

export type InventoryPlanningSeasonSearch = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PlantingSeasonStatus;
  plantingSite_id: string;
  plantingSite_name: string;
  speciesTargets?: InventoryPlanningSpeciesTargetSearch[];
  allocatedSpecies?: InventoryPlanningAllocatedSpeciesSearch[];
};

type InventoryPlanningSeasonSearchResponse = {
  results: InventoryPlanningSeasonSearch[];
};

type InventoryPlanningAvailableSearch = {
  id: string;
  scientificName: string;
  commonName?: string;
  inventory?: {
    'hardeningOffQuantity(raw)'?: string;
    'readyQuantity(raw)'?: string;
  };
};

type InventoryPlanningAvailableResponse = {
  results: InventoryPlanningAvailableSearch[];
};

export const aggregateInventoryPlanningRows = (
  seasons: InventoryPlanningSeasonSearch[],
  availableBySpecies: Map<number, number>
): InventoryPlanningSpeciesRow[] => {
  type SpeciesAcc = {
    scientificName: string;
    commonName?: string;
    seasons: Map<string, InventoryPlanningSeasonRow>;
  };

  const speciesAcc = new Map<number, SpeciesAcc>();

  seasons.forEach((season) => {
    const seasonId = Number(season.id);
    const plantingSiteId = Number(season.plantingSite_id);

    const targetsBySpecies = new Map<number, number>();
    const speciesNames = new Map<number, { scientific: string; common?: string }>();
    (season.speciesTargets ?? []).forEach((entry) => {
      const speciesId = Number(entry.species_id);
      targetsBySpecies.set(speciesId, (targetsBySpecies.get(speciesId) ?? 0) + Number(entry['quantity(raw)']));
      if (entry.species_scientificName && !speciesNames.has(speciesId)) {
        speciesNames.set(speciesId, { scientific: entry.species_scientificName, common: entry.species_commonName });
      }
    });
    const allocatedBySpecies = new Map<number, number>();
    (season.allocatedSpecies ?? []).forEach((entry) => {
      allocatedBySpecies.set(Number(entry.species_id), Number(entry['quantity(raw)']));
    });

    const speciesIdsInSeason = new Set<number>([...targetsBySpecies.keys(), ...allocatedBySpecies.keys()]);
    speciesIdsInSeason.forEach((speciesId) => {
      const target = targetsBySpecies.get(speciesId) ?? 0;
      const allocated = allocatedBySpecies.get(speciesId) ?? 0;

      let acc = speciesAcc.get(speciesId);
      if (!acc) {
        const names = speciesNames.get(speciesId);
        acc = {
          scientificName: names?.scientific ?? `#${speciesId}`,
          commonName: names?.common,
          seasons: new Map(),
        };
        speciesAcc.set(speciesId, acc);
      } else if (!acc.scientificName.startsWith('#')) {
        // already has a name
      } else {
        const names = speciesNames.get(speciesId);
        if (names) {
          acc.scientificName = names.scientific;
          acc.commonName = names.common;
        }
      }

      const seasonKey = `${seasonId}`;
      acc.seasons.set(seasonKey, {
        plantingSeasonId: seasonId,
        plantingSeasonName: season.name,
        plantingSiteId,
        plantingSiteName: season.plantingSite_name,
        startDate: season.startDate,
        endDate: season.endDate,
        status: season.status,
        target,
        allocated,
      });
    });
  });

  return [...speciesAcc.entries()]
    .map(([speciesId, acc]) => {
      const seasonRows = [...acc.seasons.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const totalTarget = seasonRows.reduce((sum, s) => sum + s.target, 0);
      const totalAllocated = seasonRows.reduce((sum, s) => sum + s.allocated, 0);
      return {
        speciesId,
        scientificName: acc.scientificName,
        commonName: acc.commonName,
        available: availableBySpecies.get(speciesId) ?? 0,
        target: totalTarget,
        allocated: totalAllocated,
        seasons: seasonRows,
      };
    })
    .sort((a, b) => a.scientificName.localeCompare(b.scientificName));
};

export const {
  useListInventoryPlanningSeasonsQuery,
  useLazyListInventoryPlanningSeasonsQuery,
  useListInventoryPlanningSpeciesAvailableQuery,
  useLazyListInventoryPlanningSpeciesAvailableQuery,
} = injectedRtkApi;
