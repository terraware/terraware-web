import { api } from '../generated/observations';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listAdHocObservations: {
      providesTags: (results) => [
        ...(results
          ? results.observations.map((observation) => ({ type: QueryTagTypes.Observation, id: observation.id }))
          : []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    listAdHocObservationResults: {
      providesTags: (results) => [
        ...(results
          ? results.observations.map((observation) => ({
              type: QueryTagTypes.Observation,
              id: observation.observationId,
            }))
          : []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
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
      ],
    },
    listObservationResults: {
      // Temporarily disable caching until update mutations are used.
      keepUnusedDataFor: 0,
      providesTags: (results) => [
        ...(results
          ? results.observations.map((observation) => ({
              type: QueryTagTypes.Observation,
              id: observation.observationId,
            }))
          : []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
    },
    listObservationSummaries: {
      providesTags: [QueryTagTypes.Observation],
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
      ],
    },
    completePlotObservation: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    updatePlotObservation: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    claimMonitoringPlot: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    getObservationMediaStream: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.ObservationMedia, id: payload.fileId }],
    },
    uploadOtherPlotMedia: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    uploadPlotPhoto: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    deletePlotPhoto: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
    },
    getPlotPhoto: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.ObservationMedia, id: payload.fileId }],
    },
    updatePlotPhoto: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
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
          ? [{ type: QueryTagTypes.Observation, id: observationResults.observation.observationId }]
          : [],
    },
  },
});
