import { api } from '../generated/t0';
import { speciesCacheTags } from '../speciesCacheTags';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getAllT0SiteDataSet: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.T0, id: plantingSiteId }],
    },
    getT0SiteData: {
      providesTags: (result, _error, plantingSiteId) => [
        { type: QueryTagTypes.T0, id: plantingSiteId },
        ...speciesCacheTags([
          ...(result?.data.plots ?? []).flatMap((plot) => plot.densityData.map((density) => density.speciesId)),
          ...(result?.data.strata ?? []).flatMap((stratum) => stratum.densityData.map((density) => density.speciesId)),
        ]),
      ],
    },
    getT0SpeciesForPlantingSite: {
      providesTags: (result, _error, plantingSiteId) => [
        { type: QueryTagTypes.T0, id: plantingSiteId },
        ...speciesCacheTags((result?.plots ?? []).flatMap((plot) => plot.species.map((species) => species.speciesId))),
      ],
    },
    getPlotObservationDensitiesForPlantingSite: {
      providesTags: (result) =>
        speciesCacheTags(
          result
            ? result.data.flatMap((plot) =>
                plot.observations.flatMap((observation) => observation.species.map((species) => species.speciesId))
              )
            : []
        ),
    },
    assignT0SiteData: {
      invalidatesTags: (_result, _error, payload) => [
        {
          type: QueryTagTypes.T0,
          id: payload.plantingSiteId,
        },
        {
          type: QueryTagTypes.PlantingSiteSurvivalRate,
          id: payload.plantingSiteId,
        },
        { type: QueryTagTypes.TrackingStats },
      ],
    },
    assignT0TempSiteData: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.T0, id: payload.plantingSiteId },
        {
          type: QueryTagTypes.PlantingSiteSurvivalRate,
          id: payload.plantingSiteId,
        },
        { type: QueryTagTypes.TrackingStats },
      ],
    },
  },
});
