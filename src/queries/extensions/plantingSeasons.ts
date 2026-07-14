import { api } from '../generated/plantingSeasons';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listPlantingSeasons: {
      providesTags: (results) => [
        ...(results ? results.seasons.map((season) => ({ type: QueryTagTypes.PlantingSeasons, id: season.id })) : []),
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
      ],
    },
    getPlantingSeason: {
      providesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasons, id: plantingSeasonId },
      ],
    },
    createPlantingSeason: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.PlantingSeasons, id: result.id }] : []),
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
      ],
    },
    updatePlantingSeason: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasons, id: arg.id },
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
      ],
    },
    deletePlantingSeason: {
      // Invalidating the per-season tags would refetch the detail page's still-mounted
      // season/species-targets/scheduled-dates queries against the just-deleted season (404s) before navigation
      // unmounts them. The season is gone, so there is nothing to refresh — only the list needs to drop it.
      invalidatesTags: () => [{ type: QueryTagTypes.PlantingSeasons, id: 'LIST' }],
    },
    closePlantingSeason: {
      invalidatesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasons, id: plantingSeasonId },
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
        { type: QueryTagTypes.PlantingSeasonDates, id: plantingSeasonId },
      ],
    },
    getSpeciesTargets: {
      providesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasons, id: plantingSeasonId },
      ],
    },
    upsertSpeciesTarget: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasons, id: arg.plantingSeasonId },
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
      ],
    },
    deleteSpeciesTarget: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasons, id: arg.plantingSeasonId },
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
      ],
    },
    upsertAllocatedSpecies: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasons, id: arg.plantingSeasonId },
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
      ],
    },
    getScheduledPlantingDates: {
      providesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasonDates, id: plantingSeasonId },
      ],
    },
    createScheduledPlantingDate: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasonDates, id: arg.plantingSeasonId },
        { type: QueryTagTypes.PlantingDateRequests, id: 'LIST' },
      ],
    },
    updateScheduledPlantingDate: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasonDates, id: arg.plantingSeasonId },
        { type: QueryTagTypes.PlantingDateRequests, id: 'LIST' },
      ],
    },
    deleteScheduledPlantingDate: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasonDates, id: arg.plantingSeasonId },
        { type: QueryTagTypes.PlantingDateRequests, id: 'LIST' },
      ],
    },
  },
});
