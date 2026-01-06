import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listEventLogEntries: build.mutation<ListEventLogEntriesApiResponse, ListEventLogEntriesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/events/list`, method: 'POST', body: queryArg }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListEventLogEntriesApiResponse = /** status 200 OK */ ListEventLogEntriesResponsePayload;
export type ListEventLogEntriesApiArg = ListEventLogEntriesRequestPayload;
export type EventActionPayloadBase = {
  type: string;
};
export type CreatedActionPayload = {
  type: 'Created';
} & EventActionPayloadBase;
export type DeletedActionPayload = {
  type: 'Deleted';
} & EventActionPayloadBase;
export type FieldUpdatedActionPayload = {
  type: 'FieldUpdated';
} & EventActionPayloadBase & {
    changedFrom?: string[];
    changedTo?: string[];
    fieldName: string;
  };
export type EventSubjectPayloadBase = {
  /** If this is true, the entity referred to by this subject has been deleted. This property will be omitted if the entity still exists, i.e., this property will always be true if it exists. */
  deleted?: boolean;
  /** A localized extended human-readable description of the subject of the event, suitable for display in cases where events for many subjects are being shown in the same list. */
  fullText: string;
  /** A localized short human-readable name (often a single word) for the subject of the event, suitable for display in cases where only events for a single subject are being shown or where the subject doesn't need to be distinguished from others of the same type. */
  shortText: string;
  type: string;
};
export type BiomassDetailsSubjectPayload = {
  type: 'BiomassDetails';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
  };
export type BiomassQuadratSpeciesSubjectPayload = {
  type: 'BiomassQuadratSpecies';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
    position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
    scientificName?: string;
    speciesId?: number;
  };
export type BiomassQuadratSubjectPayload = {
  type: 'BiomassQuadrat';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
    position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  };
export type BiomassSpeciesSubjectPayload = {
  type: 'BiomassSpecies';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
    scientificName?: string;
    speciesId?: number;
  };
export type MonitoringSpeciesSubjectPayload = {
  type: 'MonitoringSpecies';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
    scientificName?: string;
    speciesId?: number;
  };
export type ObservationPlotMediaSubjectPayload = {
  type: 'ObservationPlotMedia';
} & EventSubjectPayloadBase & {
    fileId: number;
    /** True if this file was uploaded as part of the original submission of observation data; false if it was uploaded later. */
    isOriginal: boolean;
    mediaKind: 'Photo' | 'Video';
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
  };
export type ObservationPlotSubjectPayload = {
  type: 'ObservationPlot';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
  };
export type OrganizationSubjectPayload = {
  type: 'Organization';
} & EventSubjectPayloadBase & {
    organizationId: number;
  };
export type ProjectSubjectPayload = {
  type: 'Project';
} & EventSubjectPayloadBase & {
    projectId: number;
  };
export type RecordedTreeSubjectPayload = {
  type: 'RecordedTree';
} & EventSubjectPayloadBase & {
    monitoringPlotId: number;
    observationId: number;
    plantingSiteId: number;
    recordedTreeId: number;
    treeGrowthForm: 'Tree' | 'Shrub' | 'Trunk';
    treeNumber: number;
    trunkNumber: number;
  };
export type EventLogEntryPayload = {
  action: CreatedActionPayload | DeletedActionPayload | FieldUpdatedActionPayload;
  subject:
    | BiomassDetailsSubjectPayload
    | BiomassQuadratSpeciesSubjectPayload
    | BiomassQuadratSubjectPayload
    | BiomassSpeciesSubjectPayload
    | MonitoringSpeciesSubjectPayload
    | ObservationPlotMediaSubjectPayload
    | ObservationPlotSubjectPayload
    | OrganizationSubjectPayload
    | ProjectSubjectPayload
    | RecordedTreeSubjectPayload;
  timestamp: string;
  userId: number;
  userName: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListEventLogEntriesResponsePayload = {
  events: EventLogEntryPayload[];
  status: SuccessOrError;
};
export type ListEventLogEntriesRequestPayload = {
  fileId?: number;
  monitoringPlotId?: number;
  observationId?: number;
  organizationId: number;
  plantingSiteId?: number;
  projectId?: number;
  /** If specified, only return event log entries for specific subject types. This can be used to narrow the scope of the results in cases where there might be events related to child entities and you don't care about those. */
  subjects?: (
    | 'BiomassDetails'
    | 'BiomassQuadrat'
    | 'BiomassQuadratSpecies'
    | 'BiomassSpecies'
    | 'MonitoringSpecies'
    | 'ObservationPlot'
    | 'ObservationPlotMedia'
    | 'Organization'
    | 'Project'
    | 'RecordedTree'
  )[];
};
export const { useListEventLogEntriesMutation } = injectedRtkApi;
