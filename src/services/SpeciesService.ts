import { paths } from 'src/api/types/generated-schema';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';
import { FieldNodePayload, SearchRequestPayload, SearchResponseElement } from 'src/types/Search';
import { MergeOtherSpeciesPayload, Species, SpeciesDetails, SuggestedSpecies } from 'src/types/Species';
import { parseSearchTerm } from 'src/utils/search';

import HttpService, { Response, Response2, ServerData } from './HttpService';
import SearchService from './SearchService';

/**
 * Service for species related functionality
 */

/**
 * Types exported from service
 */

export type CreateSpeciesResponse = Response & {
  speciesId: number | null;
};

export type SpeciesUploadTemplate = {
  template?: string;
};
export type SpeciesUploadStatusDetails = {
  uploadStatus?: GetUploadStatusResponsePayload;
};

export type SpeciesIdResponse = Response & SpeciesIdData;

export type SpeciesDetailsResponse = Response & SpeciesDetailsData;

export type SpeciesNamesResponse = Response & SpeciesNamesData;

export type AllSpeciesResponse = Response & AllSpeciesData;

export type AllSpeciesData = { species?: Species[] };

export type SpeciesIdData = { species?: Species };

export type SpeciesDetailsData = { speciesDetails?: SpeciesDetails };

export type SpeciesNamesData = { names?: string[] };

export type SpeciesProjectsSearchResponse = SearchResponseElement & {
  projects: {
    project_name: string;
  }[];
};

const SPECIES_ENDPOINT = '/api/v1/species';
const SPECIES_ID_ENDPOINT = '/api/v1/species/{speciesId}';
const SPECIES_TEMPLATE_ENDPOINT = '/api/v1/species/uploads/template';
const SPECIES_UPLOADS_ENDPOINT = '/api/v1/species/uploads';
const SPECIES_UPLOAD_STATUS_ENDPOINT = '/api/v1/species/uploads/{uploadId}';
const SPECIES_UPLOAD_RESOLVE_ENDPOINT = '/api/v1/species/uploads/{uploadId}/resolve';
const SPECIES_UPLOAD_PROBLEM = '/api/v1/species/problems/{problemId}';
const SPECIES_DETAILS_ENDPOINT = '/api/v1/species/lookup/details';
const SPECIES_NAMES_ENDPOINT = '/api/v1/species/lookup/names';
const MERGE_OTHER_SPECIES_ENDPOINT = '/api/v1/tracking/observations/{observationId}/mergeOtherSpecies';

type CreateSpeciesRequestPayload = paths[typeof SPECIES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type UpdateSpeciesRequestPayload =
  paths[typeof SPECIES_ID_ENDPOINT]['put']['requestBody']['content']['application/json'];
type SpeciesResponsePayload = paths[typeof SPECIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type SpeciesIdResponsePayload =
  paths[typeof SPECIES_ID_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type SpeciesDetailsResponsePayload =
  paths[typeof SPECIES_DETAILS_ENDPOINT]['get']['responses'][200]['content']['application/json'] & ServerData;
type SpeciesNamesResponsePayload =
  paths[typeof SPECIES_NAMES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpSpecies = HttpService.root(SPECIES_ENDPOINT);
const httpSpeciesId = HttpService.root(SPECIES_ID_ENDPOINT);
const httpSpeciesDetails = HttpService.root(SPECIES_DETAILS_ENDPOINT);
const httpSpeciesNames = HttpService.root(SPECIES_NAMES_ENDPOINT);
const httpMergeOtherSpecies = HttpService.root(MERGE_OTHER_SPECIES_ENDPOINT);

/**
 * create a species
 */
const createSpecies = async (species: Omit<Species, 'id'>, organizationId: number): Promise<CreateSpeciesResponse> => {
  const entity: CreateSpeciesRequestPayload = {
    ecosystemTypes: species.ecosystemTypes,
    commonName: species.commonName,
    conservationCategory: species.conservationCategory,
    ecologicalRoleKnown: species.ecologicalRoleKnown,
    familyName: species.familyName,
    growthForms: species.growthForms,
    localUsesKnown: species.localUsesKnown,
    nativeEcosystem: species.nativeEcosystem,
    organizationId,
    otherFacts: species.otherFacts,
    plantMaterialSourcingMethods: species.plantMaterialSourcingMethods,
    rare: species.rare,
    scientificName: species.scientificName,
    seedStorageBehavior: species.seedStorageBehavior,
    successionalGroups: species.successionalGroups,
  };

  const serverResponse: Response = await httpSpecies.post({ entity });

  const response: CreateSpeciesResponse = {
    ...serverResponse,
    speciesId: serverResponse.data?.id ?? null,
  };

  return response;
};

/**
 * get a species by id
 */
const getSpecies = async (speciesId: number, organizationId: number): Promise<SpeciesIdResponse> => {
  const params = { organizationId: organizationId.toString() };
  const response: SpeciesIdResponse = await httpSpeciesId.get<SpeciesIdResponsePayload, SpeciesIdData>(
    {
      params,
      urlReplacements: { '{speciesId}': speciesId.toString() },
    },
    (data) => {
      if (!data?.species) {
        return {} as SpeciesIdData;
      }

      const speciesData: SpeciesIdData = {
        species: data.species,
      };

      return speciesData;
    }
  );

  return response;
};

/**
 * Update a species
 */
const updateSpecies = async (species: Species, organizationId: number): Promise<Response> => {
  const entity: UpdateSpeciesRequestPayload = {
    averageWoodDensity: species.averageWoodDensity,
    ecosystemTypes: species.ecosystemTypes,
    commonName: species.commonName,
    conservationCategory: species.conservationCategory,
    dbhSource: species.dbhSource,
    dbhValue: species.dbhValue,
    ecologicalRoleKnown: species.ecologicalRoleKnown,
    familyName: species.familyName,
    growthForms: species.growthForms,
    heightAtMaturitySource: species.heightAtMaturitySource,
    heightAtMaturityValue: species.heightAtMaturityValue,
    localUsesKnown: species.localUsesKnown,
    nativeEcosystem: species.nativeEcosystem,
    organizationId,
    otherFacts: species.otherFacts,
    plantMaterialSourcingMethods: species.plantMaterialSourcingMethods,
    rare: species.rare,
    scientificName: species.scientificName,
    seedStorageBehavior: species.seedStorageBehavior,
    successionalGroups: species.successionalGroups,
    woodDensityLevel: species.woodDensityLevel,
  };

  return await httpSpeciesId.put({
    entity,
    urlReplacements: {
      '{speciesId}': species.id.toString(),
    },
  });
};

/**
 * delete a species
 */
const deleteSpecies = async (speciesId: number, organizationId: number): Promise<Response> => {
  const params = { organizationId: organizationId.toString() };
  const response: Response = await httpSpeciesId.delete({
    params,
    urlReplacements: {
      '{speciesId}': speciesId.toString(),
    },
  });

  return response;
};

/**
 * Get all species
 */
const getAllSpecies = async (organizationId: number, inUse?: boolean): Promise<Response2<SpeciesResponsePayload>> => {
  const params: any = { organizationId: organizationId.toString() };

  if (inUse) {
    params.inUse = inUse.toString();
  }

  const response: AllSpeciesResponse = await httpSpecies.get2<SpeciesResponsePayload>({ params });

  return response;
};

/**
 * Download species template
 */
const downloadSpeciesTemplate = async (): Promise<Response & SpeciesUploadTemplate> => {
  const response: Response & SpeciesUploadTemplate = await HttpService.root(SPECIES_TEMPLATE_ENDPOINT).get<
    any,
    SpeciesUploadTemplate
  >({}, (data) => ({ template: data }));
  return response;
};

/**
 * upload species
 */
const uploadSpecies = async (file: File, organizationId: string): Promise<UploadFileResponse> => {
  const entity = new FormData();
  entity.append('organizationId', organizationId);
  entity.append('file', file);
  const headers = { 'content-type': 'multipart/form-data' };

  const serverResponse: Response = await HttpService.root(SPECIES_UPLOADS_ENDPOINT).post({ entity, headers });
  const response: UploadFileResponse = {
    ...serverResponse,
    id: serverResponse?.data?.id ?? -1,
  };

  return response;
};

/**
 * check on upload status
 */
const getSpeciesUploadStatus = async (uploadId: number): Promise<Response & SpeciesUploadStatusDetails> => {
  const response: Response & SpeciesUploadStatusDetails = await HttpService.root(SPECIES_UPLOAD_STATUS_ENDPOINT).get<
    GetUploadStatusResponsePayload,
    SpeciesUploadStatusDetails
  >(
    {
      urlReplacements: {
        '{uploadId}': uploadId.toString(),
      },
    },
    (data) => ({ uploadStatus: data })
  );

  return response;
};

/**
 * Resolve species upload
 */
const resolveSpeciesUpload = async (uploadId: number, overwriteExisting: boolean): Promise<Response> => {
  return await HttpService.root(SPECIES_UPLOAD_RESOLVE_ENDPOINT).post({
    urlReplacements: {
      '{uploadId}': uploadId.toString(),
    },
    entity: { overwriteExisting: overwriteExisting.toString() },
  });
};

/**
 * Accept species upload problem suggestion
 */
const acceptProblemSuggestion = async (problemId: number): Promise<Response> => {
  return await HttpService.root(SPECIES_UPLOAD_PROBLEM).post({
    urlReplacements: {
      '{problemId}': problemId.toString(),
    },
  });
};

/**
 * Ignore species upload problem suggestion
 */
const ignoreProblemSuggestion = async (problemId: number): Promise<Response> => {
  return await HttpService.root(SPECIES_UPLOAD_PROBLEM).delete({
    urlReplacements: {
      '{problemId}': problemId.toString(),
    },
  });
};

/**
 * get details of a species
 */
const getSpeciesDetails = async (scientificName: string): Promise<SpeciesDetailsResponse> => {
  const params = { scientificName };
  const response: SpeciesDetailsResponse = await httpSpeciesDetails.get<
    SpeciesDetailsResponsePayload,
    SpeciesDetailsData
  >(
    {
      params,
    },
    (data) => ({ speciesDetails: data })
  );

  return response;
};

/**
 * get all species names
 */
const getSpeciesNames = async (search: string): Promise<SpeciesNamesResponse> => {
  const params = { search };

  const response: SpeciesNamesResponse =
    search.length > 1
      ? await httpSpeciesNames.get<SpeciesNamesResponsePayload, SpeciesNamesData>(
          {
            params,
          },
          (data) => ({ names: data?.names })
        )
      : { names: [], requestSucceeded: true };

  return response;
};

/**
 * Search species for selectors
 */
const suggestSpecies = async (organizationId: number, query: string): Promise<SuggestedSpecies[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'species',
    fields: ['scientificName', 'commonName', 'id'],
    sortOrder: [{ field: 'scientificName', direction: 'Ascending' }],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          type: 'Exact',
          values: [organizationId],
        },
      ],
    },
    count: 0,
  };

  if (query) {
    const searchValueChildren: FieldNodePayload[] = [];
    const { type, values } = parseSearchTerm(query);

    const nameNode: FieldNodePayload = {
      operation: 'field',
      field: 'scientificName',
      type,
      values,
    };
    searchValueChildren.push(nameNode);

    const commonNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'commonName',
      type,
      values,
    };
    searchValueChildren.push(commonNameNode);

    params.search.children.push({
      operation: 'or',
      children: searchValueChildren,
    });
  }

  return await SearchService.search(params);
};

const getSpeciesProjects = (
  organizationId: number,
  speciesId: number
): Promise<SpeciesProjectsSearchResponse[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'inventories',
    fields: ['projects.project_name'],
    sortOrder: [{ field: 'projects.project_name', direction: 'Ascending' }],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          type: 'Exact',
          values: [organizationId],
        },
        {
          operation: 'field',
          field: 'species_id',
          type: 'Exact',
          values: [`${speciesId}`],
        },
      ],
    },
    count: 0,
  };

  return SearchService.search<SpeciesProjectsSearchResponse>(params);
};

const mergeOtherSpecies = (
  mergeOtherSpeciesPayload: MergeOtherSpeciesPayload,
  observationId: number
): Promise<Response> => {
  const urlReplacements = {
    '{observationId}': `${observationId}`,
  };
  return httpMergeOtherSpecies.post({
    urlReplacements,
    entity: mergeOtherSpeciesPayload,
  });
};

/**
 * Exported functions
 */
const SpeciesService = {
  acceptProblemSuggestion,
  createSpecies,
  deleteSpecies,
  downloadSpeciesTemplate,
  getAllSpecies,
  getSpecies,
  getSpeciesDetails,
  getSpeciesNames,
  getSpeciesProjects,
  getSpeciesUploadStatus,
  ignoreProblemSuggestion,
  mergeOtherSpecies,
  resolveSpeciesUpload,
  suggestSpecies,
  updateSpecies,
  uploadSpecies,
};

export default SpeciesService;
