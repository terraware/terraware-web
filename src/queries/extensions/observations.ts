import { api } from '../generated/observations';
import { speciesCacheTags } from '../speciesCacheTags';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listObservations: {
      providesTags: (results) => [
        ...(results
          ? results.observations.map((observation) => ({ type: QueryTagTypes.Observation, id: observation.id }))
          : []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    scheduleObservation: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.Observation, id: result.id }] : []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    completeAdHocObservation: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.Observation, id: result.observationId }] : []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
        { type: QueryTagTypes.Activities, id: 'LIST' },
        { type: QueryTagTypes.FunderActivities, id: 'LIST' },
      ],
    },
    listObservationResults: {
      // Temporarily disable caching until update mutations are used.
      keepUnusedDataFor: 0,
      providesTags: (results) => [
        ...(results
          ? results.observations.flatMap((observation) => [
              { type: QueryTagTypes.Observation, id: observation.observationId },
              { type: QueryTagTypes.PlantingSiteSurvivalRate, id: observation.plantingSiteId },
            ])
          : []),
        ...speciesCacheTags(
          results ? results.observations.flatMap((observation) => observation.species.map((s) => s.speciesId)) : []
        ),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    getObservation: {
      providesTags: (observation) =>
        observation ? [{ type: QueryTagTypes.Observation, id: observation.observation.id }] : [],
    },
    rescheduleObservation: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    abandonObservation: {
      invalidatesTags: (_results, _error, observationId) => [
        { type: QueryTagTypes.Observation, id: observationId },
        { type: QueryTagTypes.Observation, id: 'LIST' },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    mergeOtherSpecies: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    listAssignedPlots: {
      providesTags: (_results, _error, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
    },
    getOneAssignedPlot: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    updateCompletedObservationPlot: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Observation, id: 'LIST' },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    completePlotObservation: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    updatePlotObservation: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    claimMonitoringPlot: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    getObservationMediaStream: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.ObservationMedia, id: payload.fileId }],
    },
    uploadOtherPlotMedia: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    uploadPlotPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    deletePlotPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    getPlotPhoto: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.ObservationMedia, id: payload.fileId }],
    },
    updatePlotPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Observation, id: payload.observationId },
        { type: QueryTagTypes.Activities },
        { type: QueryTagTypes.FunderActivities },
      ],
    },
    releaseMonitoringPlot: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    replaceObservationPlot: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    getObservationResults: {
      providesTags: (observationResults) =>
        observationResults
          ? [
              { type: QueryTagTypes.Observation, id: observationResults.observation.observationId },
              { type: QueryTagTypes.PlantingSiteSurvivalRate, id: observationResults.observation.plantingSiteId },
              ...speciesCacheTags(observationResults.observation.species.map((s) => s.speciesId)),
            ]
          : [],
    },
  },
});
