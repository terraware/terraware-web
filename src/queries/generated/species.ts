import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSpecies: build.query<ListSpeciesApiResponse, ListSpeciesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species`,
        params: {
          organizationId: queryArg.organizationId,
          inUse: queryArg.inUse,
        },
      }),
    }),
    createSpecies: build.mutation<CreateSpeciesApiResponse, CreateSpeciesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species`, method: 'POST', body: queryArg }),
    }),
    getSpeciesDetails: build.query<GetSpeciesDetailsApiResponse, GetSpeciesDetailsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species/lookup/details`,
        params: {
          scientificName: queryArg.scientificName,
          language: queryArg.language,
        },
      }),
    }),
    listSpeciesNames: build.query<ListSpeciesNamesApiResponse, ListSpeciesNamesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species/lookup/names`,
        params: {
          search: queryArg.search,
          maxResults: queryArg.maxResults,
        },
      }),
    }),
    deleteProblem: build.mutation<DeleteProblemApiResponse, DeleteProblemApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/problems/${queryArg}`, method: 'DELETE' }),
    }),
    getSpeciesProblem: build.query<GetSpeciesProblemApiResponse, GetSpeciesProblemApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/problems/${queryArg}` }),
    }),
    acceptProblemSuggestion: build.mutation<AcceptProblemSuggestionApiResponse, AcceptProblemSuggestionApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/problems/${queryArg}`, method: 'POST' }),
    }),
    assignSpeciesToProjects: build.mutation<AssignSpeciesToProjectsApiResponse, AssignSpeciesToProjectsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/projects/assign`, method: 'POST', body: queryArg }),
    }),
    overrideProjectSpeciesData: build.mutation<OverrideProjectSpeciesDataApiResponse, OverrideProjectSpeciesDataApiArg>(
      {
        query: (queryArg) => ({ url: `/api/v1/species/projects/override`, method: 'POST', body: queryArg }),
      }
    ),
    unassignSpeciesFromProjects: build.mutation<
      UnassignSpeciesFromProjectsApiResponse,
      UnassignSpeciesFromProjectsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/species/projects/unassign`, method: 'POST', body: queryArg }),
    }),
    uploadSpeciesList: build.mutation<UploadSpeciesListApiResponse, UploadSpeciesListApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species/uploads`,
        method: 'POST',
        body: queryArg.body,
        params: {
          organizationId: queryArg.organizationId,
        },
      }),
    }),
    getSpeciesListUploadTemplate: build.query<
      GetSpeciesListUploadTemplateApiResponse,
      GetSpeciesListUploadTemplateApiArg
    >({
      query: () => ({ url: `/api/v1/species/uploads/template` }),
    }),
    deleteSpeciesListUpload: build.mutation<DeleteSpeciesListUploadApiResponse, DeleteSpeciesListUploadApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/uploads/${queryArg}`, method: 'DELETE' }),
    }),
    getSpeciesListUploadStatus: build.query<GetSpeciesListUploadStatusApiResponse, GetSpeciesListUploadStatusApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/uploads/${queryArg}` }),
    }),
    resolveSpeciesListUpload: build.mutation<ResolveSpeciesListUploadApiResponse, ResolveSpeciesListUploadApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species/uploads/${queryArg.uploadId}/resolve`,
        method: 'POST',
        body: queryArg.resolveUploadRequestPayload,
      }),
    }),
    deleteSpecies: build.mutation<DeleteSpeciesApiResponse, DeleteSpeciesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/species/${queryArg}`, method: 'DELETE' }),
    }),
    getSpecies: build.query<GetSpeciesApiResponse, GetSpeciesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species/${queryArg.speciesId}`,
        params: {
          organizationId: queryArg.organizationId,
        },
      }),
    }),
    updateSpecies: build.mutation<UpdateSpeciesApiResponse, UpdateSpeciesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/species/${queryArg.speciesId}`,
        method: 'PUT',
        body: queryArg.updateSpeciesRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListSpeciesApiResponse = /** status 200 OK */ ListSpeciesResponsePayload;
export type ListSpeciesApiArg = {
  /** Organization whose species should be listed. */
  organizationId: number;
  /** Only list species that are currently used in the organization's inventory, accessions or planting sites. */
  inUse?: boolean;
};
export type CreateSpeciesApiResponse = /** status 200 Species created. */ CreateSpeciesResponsePayload;
export type CreateSpeciesApiArg = CreateSpeciesRequestPayload;
export type GetSpeciesDetailsApiResponse = /** status 200 OK */ SpeciesLookupDetailsResponsePayload;
export type GetSpeciesDetailsApiArg = {
  /** Exact scientific name to look up. This name is case-sensitive. */
  scientificName: string;
  /** If specified, only return common names in this language or whose language is unknown. Names with unknown languages are always included. This is a two-letter ISO 639-1 language code. */
  language?: string;
};
export type ListSpeciesNamesApiResponse = /** status 200 OK */ SpeciesLookupNamesResponsePayload;
export type ListSpeciesNamesApiArg = {
  /** Space-delimited list of word prefixes to search for. Non-alphabetic characters are ignored, and matches are case-insensitive. The order of prefixes is significant; "ag sc" will match "Aglaonema schottianum" but won't match "Scabiosa agrestis". */
  search: string;
  /** Maximum number of results to return. */
  maxResults?: number;
};
export type DeleteProblemApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteProblemApiArg = number;
export type GetSpeciesProblemApiResponse = /** status 200 Problem retrieved. */ GetSpeciesProblemResponsePayload;
export type GetSpeciesProblemApiArg = number;
export type AcceptProblemSuggestionApiResponse =
  /** status 200 Suggestion applied. Response contains the updated species information. */ GetSpeciesResponsePayload;
export type AcceptProblemSuggestionApiArg = number;
export type AssignSpeciesToProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type AssignSpeciesToProjectsApiArg = AssignSpeciesToProjectsPayload;
export type OverrideProjectSpeciesDataApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type OverrideProjectSpeciesDataApiArg = OverrideSpeciesProjectDataRequestPayload;
export type UnassignSpeciesFromProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UnassignSpeciesFromProjectsApiArg = AssignSpeciesToProjectsPayload;
export type UploadSpeciesListApiResponse =
  /** status 200 The file has been successfully received. It will be processed asynchronously; use the ID returned in the response payload to poll for its status using the `/api/v1/species/uploads/{uploadId}` GET endpoint. */ UploadFileResponsePayload;
export type UploadSpeciesListApiArg = {
  organizationId: number;
  body: {
    file: Blob;
  };
};
export type GetSpeciesListUploadTemplateApiResponse = /** status 200 OK */ string;
export type GetSpeciesListUploadTemplateApiArg = void;
export type DeleteSpeciesListUploadApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteSpeciesListUploadApiArg = number;
export type GetSpeciesListUploadStatusApiResponse = /** status 200 OK */ GetUploadStatusResponsePayload;
export type GetSpeciesListUploadStatusApiArg = number;
export type ResolveSpeciesListUploadApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ResolveSpeciesListUploadApiArg = {
  uploadId: number;
  resolveUploadRequestPayload: ResolveUploadRequestPayload;
};
export type DeleteSpeciesApiResponse = /** status 200 Species deleted. */ SimpleSuccessResponsePayload;
export type DeleteSpeciesApiArg = number;
export type GetSpeciesApiResponse = /** status 200 Species retrieved. */ GetSpeciesResponsePayload;
export type GetSpeciesApiArg = {
  speciesId: number;
  /** Organization whose information about the species should be returned. */
  organizationId: number;
};
export type UpdateSpeciesApiResponse =
  /** status 200 Species updated or merged with an existing species. */ SimpleSuccessResponsePayload;
export type UpdateSpeciesApiArg = {
  speciesId: number;
  updateSpeciesRequestPayload: UpdateSpeciesRequestPayload;
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
  overriddenJustification?: string;
  overriddenNativity?: 'Invasive' | 'Introduced' | 'Native' | 'Unknown';
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
export type SuccessOrError = 'ok' | 'error';
export type ListSpeciesResponsePayload = {
  species: SpeciesResponseElement[];
  status: SuccessOrError;
};
export type CreateSpeciesResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateSpeciesRequestPayload = {
  averageWoodDensity?: number;
  commonName?: string;
  /** IUCN Red List conservation category code. */
  conservationCategory?: 'CR' | 'DD' | 'EN' | 'EW' | 'EX' | 'LC' | 'NE' | 'NT' | 'VU';
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
  localUsesKnown?: string;
  nativeEcosystem?: string;
  /** Which organization's species list to update. */
  organizationId: number;
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
  projectIds?: number[];
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
export type SpeciesLookupCommonNamePayload = {
  /** ISO 639-1 two-letter language code indicating the name's language. Some common names in the server's taxonomic database are not tagged with languages; this value will not be present for those names. */
  language?: string;
  name: string;
};
export type SpeciesLookupDetailsResponsePayload = {
  /** IUCN Red List conservation category code. */
  commonNameSource: SpeciesDataSourcePayload;
  /** List of known common names for the species, if any. */
  commonNames?: SpeciesLookupCommonNamePayload[];
  conservationCategory?: 'CR' | 'DD' | 'EN' | 'EW' | 'EX' | 'LC' | 'NE' | 'NT' | 'VU';
  familyName: string;
  familyNameSource: SpeciesDataSourcePayload;
  /** If this is not the accepted name for the species, the type of problem the name has. Currently, this will always be "Name Is Synonym". */
  problemType?: 'Name Misspelled' | 'Name Not Found' | 'Name Is Synonym';
  scientificName: string;
  status: SuccessOrError;
  /** If this is not the accepted name for the species, the name to suggest as an alternative. */
  suggestedScientificName?: string;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SpeciesLookupNamesResponsePayload = {
  names: string[];
  /** True if there were more matching names than could be included in the response. */
  partial: boolean;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type GetSpeciesProblemResponsePayload = {
  problem: SpeciesProblemElement;
  status: SuccessOrError;
};
export type GetSpeciesResponsePayload = {
  species: SpeciesResponseElement;
  status: SuccessOrError;
};
export type SpeciesProjectsPayload = {
  projectIds: number[];
  speciesId: number;
};
export type AssignSpeciesToProjectsPayload = {
  /** The species to assign, each with the projects to associate it with. */
  species: SpeciesProjectsPayload[];
};
export type OverrideSpeciesProjectDataElement = {
  overriddenJustification: string;
  overriddenNativity: 'Invasive' | 'Introduced' | 'Native' | 'Unknown';
  projectId?: number;
  speciesId: number;
};
export type OverrideSpeciesProjectDataRequestPayload = {
  overrides: OverrideSpeciesProjectDataElement[];
};
export type UploadFileResponsePayload = {
  /** ID of uploaded file. This may be used to poll for the file's status. */
  id: number;
  status: SuccessOrError;
};
export type UploadProblemPayload = {
  /** Name of the field with the problem. Absent if the problem isn't specific to a single field. */
  fieldName?: string;
  /** Human-readable description of the problem. */
  message?: string;
  /** Position (row number) of the record with the problem. */
  position?: number;
  type: 'Unrecognized Value' | 'Missing Required Value' | 'Duplicate Value' | 'Malformed Value';
  /** The value that caused the problem. Absent if the problem wasn't caused by a specific field value. */
  value?: string;
};
export type GetUploadStatusDetailsPayload = {
  errors?: UploadProblemPayload[];
  /** True if the server is finished processing the file, either successfully or not. */
  finished: boolean;
  id: number;
  status:
    | 'Receiving'
    | 'Validating'
    | 'Processing'
    | 'Completed'
    | 'Processing Failed'
    | 'Invalid'
    | 'Receiving Failed'
    | 'Awaiting Validation'
    | 'Awaiting User Action'
    | 'Awaiting Processing';
  warnings?: UploadProblemPayload[];
};
export type GetUploadStatusResponsePayload = {
  details: GetUploadStatusDetailsPayload;
  status: SuccessOrError;
};
export type ResolveUploadRequestPayload = {
  /** If true, the data for entries that already exist will be overwritten with the values in the uploaded file. If false, only entries that don't already exist will be imported. */
  overwriteExisting: boolean;
};
export type UpdateSpeciesRequestPayload = {
  averageWoodDensity?: number;
  commonName?: string;
  /** IUCN Red List conservation category code. */
  conservationCategory?: 'CR' | 'DD' | 'EN' | 'EW' | 'EX' | 'LC' | 'NE' | 'NT' | 'VU';
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
  localUsesKnown?: string;
  nativeEcosystem?: string;
  /** Which organization's species list to update. */
  organizationId: number;
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
export const {
  useListSpeciesQuery,
  useLazyListSpeciesQuery,
  useCreateSpeciesMutation,
  useGetSpeciesDetailsQuery,
  useLazyGetSpeciesDetailsQuery,
  useListSpeciesNamesQuery,
  useLazyListSpeciesNamesQuery,
  useDeleteProblemMutation,
  useGetSpeciesProblemQuery,
  useLazyGetSpeciesProblemQuery,
  useAcceptProblemSuggestionMutation,
  useAssignSpeciesToProjectsMutation,
  useOverrideProjectSpeciesDataMutation,
  useUnassignSpeciesFromProjectsMutation,
  useUploadSpeciesListMutation,
  useGetSpeciesListUploadTemplateQuery,
  useLazyGetSpeciesListUploadTemplateQuery,
  useDeleteSpeciesListUploadMutation,
  useGetSpeciesListUploadStatusQuery,
  useLazyGetSpeciesListUploadStatusQuery,
  useResolveSpeciesListUploadMutation,
  useDeleteSpeciesMutation,
  useGetSpeciesQuery,
  useLazyGetSpeciesQuery,
  useUpdateSpeciesMutation,
} = injectedRtkApi;
