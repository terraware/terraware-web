import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    deleteParticipantProjectSpecies: build.mutation<
      DeleteParticipantProjectSpeciesApiResponse,
      DeleteParticipantProjectSpeciesApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/species`, method: 'DELETE', body: queryArg }),
    }),
    createParticipantProjectSpecies: build.mutation<
      CreateParticipantProjectSpeciesApiResponse,
      CreateParticipantProjectSpeciesApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/species`, method: 'POST', body: queryArg }),
    }),
    assignParticipantProjectSpecies: build.mutation<
      AssignParticipantProjectSpeciesApiResponse,
      AssignParticipantProjectSpeciesApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/species/assign`, method: 'POST', body: queryArg }),
    }),
    getParticipantProjectSpecies: build.query<
      GetParticipantProjectSpeciesApiResponse,
      GetParticipantProjectSpeciesApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/species/${queryArg}` }),
    }),
    updateParticipantProjectSpecies: build.mutation<
      UpdateParticipantProjectSpeciesApiResponse,
      UpdateParticipantProjectSpeciesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/species/${queryArg.participantProjectSpeciesId}`,
        method: 'PUT',
        body: queryArg.updateParticipantProjectSpeciesPayload,
      }),
    }),
    getSpeciesForProject: build.query<GetSpeciesForProjectApiResponse, GetSpeciesForProjectApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/species` }),
    }),
    getParticipantProjectSpeciesSnapshot: build.query<
      GetParticipantProjectSpeciesSnapshotApiResponse,
      GetParticipantProjectSpeciesSnapshotApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/species/snapshots/${queryArg.deliverableId}`,
      }),
    }),
    getProjectsForSpecies: build.query<GetProjectsForSpeciesApiResponse, GetProjectsForSpeciesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/species/${queryArg}/projects` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type DeleteParticipantProjectSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteParticipantProjectSpeciesApiArg = DeleteParticipantProjectSpeciesPayload;
export type CreateParticipantProjectSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ GetParticipantProjectSpeciesResponsePayload;
export type CreateParticipantProjectSpeciesApiArg = CreateParticipantProjectSpeciesPayload;
export type AssignParticipantProjectSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type AssignParticipantProjectSpeciesApiArg = AssignParticipantProjectSpeciesPayload;
export type GetParticipantProjectSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ GetParticipantProjectSpeciesResponsePayload;
export type GetParticipantProjectSpeciesApiArg = number;
export type UpdateParticipantProjectSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateParticipantProjectSpeciesApiArg = {
  participantProjectSpeciesId: number;
  updateParticipantProjectSpeciesPayload: UpdateParticipantProjectSpeciesPayload;
};
export type GetSpeciesForProjectApiResponse =
  /** status 200 The requested operation succeeded. */ GetSpeciesForParticipantProjectsResponsePayload;
export type GetSpeciesForProjectApiArg = number;
export type GetParticipantProjectSpeciesSnapshotApiResponse =
  /** status 200 The file was successfully retrieved. */ Blob;
export type GetParticipantProjectSpeciesSnapshotApiArg = {
  projectId: number;
  deliverableId: number;
};
export type GetProjectsForSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ GetParticipantProjectsForSpeciesResponsePayload;
export type GetProjectsForSpeciesApiArg = number;
export type SuccessOrError = 'ok' | 'error';
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type DeleteParticipantProjectSpeciesPayload = {
  participantProjectSpeciesIds: number[];
};
export type ParticipantProjectSpeciesPayload = {
  feedback?: string;
  id: number;
  internalComment?: string;
  projectId: number;
  rationale?: string;
  speciesId: number;
  speciesNativeCategory?: 'Native' | 'Non-native';
  submissionStatus:
    | 'Not Submitted'
    | 'In Review'
    | 'Needs Translation'
    | 'Approved'
    | 'Rejected'
    | 'Not Needed'
    | 'Completed';
};
export type GetParticipantProjectSpeciesResponsePayload = {
  participantProjectSpecies: ParticipantProjectSpeciesPayload;
  status: SuccessOrError;
};
export type CreateParticipantProjectSpeciesPayload = {
  projectId: number;
  rationale?: string;
  speciesId: number;
  speciesNativeCategory?: 'Native' | 'Non-native';
};
export type AssignParticipantProjectSpeciesPayload = {
  projectIds: number[];
  speciesIds: number[];
};
export type UpdateParticipantProjectSpeciesPayload = {
  feedback?: string;
  internalComment?: string;
  rationale?: string;
  speciesNativeCategory?: 'Native' | 'Non-native';
  submissionStatus:
    | 'Not Submitted'
    | 'In Review'
    | 'Needs Translation'
    | 'Approved'
    | 'Rejected'
    | 'Not Needed'
    | 'Completed';
};
export type ProjectPayload = {
  botanicalCountryCode?: string;
  countryCode?: string;
  createdBy?: number;
  createdTime?: string;
  description?: string;
  id: number;
  modifiedBy?: number;
  modifiedTime?: string;
  name: string;
  organizationId: number;
  phase?:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
};
export type SpeciesDataSourcePayload = {
  datasetDate: string;
  datasetType: 'GBIF' | 'WCVP' | 'GRIIS' | 'RESOLVE' | 'NaturalEarth';
};
export type SpeciesProblemElement = {
  field: 'Scientific Name';
  id: number;
  /** Value for the field in question that would correct the problem. Absent if the system is unable to calculate a corrected value. */
  suggestedValue?: string;
  type: 'Name Misspelled' | 'Name Not Found' | 'Name Is Synonym';
};
export type SpeciesProjectElement = {
  calculatedNativity?: 'Invasive' | 'Introduced' | 'Native' | 'Unknown';
  calculatedNativitySource?: SpeciesDataSourcePayload;
  overriddenBy?: number;
  overriddenByName?: string;
  overriddenJustification?: string;
  overriddenNativity?: 'Invasive' | 'Introduced' | 'Native' | 'Unknown';
  overriddenTime?: string;
  /** Latest calculated nativity value for the species, if different from calculatedNativity. This nativity is considered 'pending' until it is accepted by the user. */
  pendingNativity?: 'Invasive' | 'Introduced' | 'Native' | 'Unknown';
  pendingNativitySource?: SpeciesDataSourcePayload;
  projectId?: number;
};
export type SpeciesResponseElement = {
  averageWoodDensity?: number;
  commonName?: string;
  commonNameSource?: SpeciesDataSourcePayload;
  /** IUCN Red List conservation category code. */
  conservationCategory?: 'CR' | 'DD' | 'EN' | 'EW' | 'EX' | 'LC' | 'NE' | 'NT' | 'VU';
  createdTime: string;
  dbhSource?: string;
  dbhValue?: number;
  ecologicalRoleKnown?: string;
  ecosystemTypes?: (
    | 'Boreal forests/Taiga'
    | 'Deserts and xeric shrublands'
    | 'Flooded grasslands and savannas'
    | 'Mangroves'
    | 'Mediterranean forests, woodlands and scrubs'
    | 'Montane grasslands and shrublands'
    | 'Temperate broad leaf and mixed forests'
    | 'Temperate coniferous forest'
    | 'Temperate grasslands, savannas and shrublands'
    | 'Tropical and subtropical coniferous forests'
    | 'Tropical and subtropical dry broad leaf forests'
    | 'Tropical and subtropical grasslands, savannas and shrublands'
    | 'Tropical and subtropical moist broad leaf forests'
    | 'Tundra'
  )[];
  familyName?: string;
  familyNameSource?: SpeciesDataSourcePayload;
  growthForms?: (
    | 'Tree'
    | 'Shrub'
    | 'Forb'
    | 'Graminoid'
    | 'Fern'
    | 'Fungus'
    | 'Lichen'
    | 'Moss'
    | 'Vine'
    | 'Liana'
    | 'Subshrub'
    | 'Multiple Forms'
    | 'Mangrove'
    | 'Herb'
  )[];
  heightAtMaturitySource?: string;
  heightAtMaturityValue?: number;
  id: number;
  localUsesKnown?: string;
  modifiedTime: string;
  nativeEcosystem?: string;
  otherFacts?: string;
  plantMaterialSourcingMethods?: (
    | 'Seed collection & germination'
    | 'Seed purchase & germination'
    | 'Mangrove propagules'
    | 'Vegetative propagation'
    | 'Wildling harvest'
    | 'Seedling purchase'
    | 'Other'
  )[];
  problems?: SpeciesProblemElement[];
  projects: SpeciesProjectElement[];
  rare?: boolean;
  scientificName: string;
  seedStorageBehavior?:
    | 'Orthodox'
    | 'Recalcitrant'
    | 'Intermediate'
    | 'Unknown'
    | 'Likely Orthodox'
    | 'Likely Recalcitrant'
    | 'Likely Intermediate'
    | 'Intermediate - Cool Temperature Sensitive'
    | 'Intermediate - Partial Desiccation Tolerant'
    | 'Intermediate - Short Lived'
    | 'Likely Intermediate - Cool Temperature Sensitive'
    | 'Likely Intermediate - Partial Desiccation Tolerant'
    | 'Likely Intermediate - Short Lived';
  successionalGroups?: ('Pioneer' | 'Early secondary' | 'Late secondary' | 'Mature')[];
  woodDensityLevel?: 'Species' | 'Genus' | 'Family';
};
export type SpeciesForParticipantProjectPayload = {
  participantProjectSpecies: ParticipantProjectSpeciesPayload;
  project: ProjectPayload;
  species: SpeciesResponseElement;
};
export type GetSpeciesForParticipantProjectsResponsePayload = {
  speciesForParticipantProjects: SpeciesForParticipantProjectPayload[];
  status: SuccessOrError;
};
export type ParticipantProjectForSpeciesPayload = {
  /** This deliverable ID is associated with the project's active or most recent module, if any. */
  deliverableId?: number;
  participantProjectSpeciesId: number;
  participantProjectSpeciesNativeCategory?: 'Native' | 'Non-native';
  participantProjectSpeciesSubmissionStatus:
    | 'Not Submitted'
    | 'In Review'
    | 'Needs Translation'
    | 'Approved'
    | 'Rejected'
    | 'Not Needed'
    | 'Completed';
  projectId: number;
  projectName: string;
  speciesId: number;
};
export type GetParticipantProjectsForSpeciesResponsePayload = {
  participantProjectsForSpecies: ParticipantProjectForSpeciesPayload[];
  status: SuccessOrError;
};
export const {
  useDeleteParticipantProjectSpeciesMutation,
  useCreateParticipantProjectSpeciesMutation,
  useAssignParticipantProjectSpeciesMutation,
  useGetParticipantProjectSpeciesQuery,
  useLazyGetParticipantProjectSpeciesQuery,
  useUpdateParticipantProjectSpeciesMutation,
  useGetSpeciesForProjectQuery,
  useLazyGetSpeciesForProjectQuery,
  useGetParticipantProjectSpeciesSnapshotQuery,
  useLazyGetParticipantProjectSpeciesSnapshotQuery,
  useGetProjectsForSpeciesQuery,
  useLazyGetProjectsForSpeciesQuery,
} = injectedRtkApi;
