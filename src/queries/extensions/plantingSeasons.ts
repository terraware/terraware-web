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
      invalidatesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasons, id: plantingSeasonId },
        { type: QueryTagTypes.PlantingSeasons, id: 'LIST' },
        { type: QueryTagTypes.PlantingSeasonDates, id: plantingSeasonId },
      ],
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
      ],
    },
    updateScheduledPlantingDate: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasonDates, id: arg.plantingSeasonId },
      ],
    },
    deleteScheduledPlantingDate: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasonDates, id: arg.plantingSeasonId },
      ],
    },
  },
});
