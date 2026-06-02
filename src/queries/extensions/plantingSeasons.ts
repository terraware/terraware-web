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
      ],
    },
    getSpeciesTargets: {
      providesTags: (_result, _error, plantingSeasonId) => [
        { type: QueryTagTypes.PlantingSeasons, id: `${plantingSeasonId}-targets` },
      ],
    },
    upsertSpeciesTarget: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasons, id: `${arg.plantingSeasonId}-targets` },
      ],
    },
    deleteSpeciesTarget: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.PlantingSeasons, id: `${arg.plantingSeasonId}-targets` },
      ],
    },
  },
});
