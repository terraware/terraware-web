import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';
import { FieldNodePayload, SearchRequestPayload, SearchResponseElement } from 'src/types/Search';
import { MergeOtherSpeciesPayload, SuggestedSpecies } from 'src/types/Species';
import { parseSearchTerm } from 'src/utils/search';

import HttpService, { Response } from './HttpService';
import SearchService from './SearchService';

/**
 * Service for species related functionality
 */

/**
 * Types exported from service
 */

export type SpeciesUploadTemplate = {
  template?: string;
};
export type SpeciesUploadStatusDetails = {
  uploadStatus?: GetUploadStatusResponsePayload;
};

export type SpeciesProjectsSearchResponse = SearchResponseElement & {
  projects: {
    project_name: string;
  }[];
};

const SPECIES_TEMPLATE_ENDPOINT = '/api/v1/species/uploads/template';
const SPECIES_UPLOADS_ENDPOINT = '/api/v1/species/uploads';
const SPECIES_UPLOAD_STATUS_ENDPOINT = '/api/v1/species/uploads/{uploadId}';
const SPECIES_UPLOAD_RESOLVE_ENDPOINT = '/api/v1/species/uploads/{uploadId}/resolve';
const MERGE_OTHER_SPECIES_ENDPOINT = '/api/v1/tracking/observations/{observationId}/mergeOtherSpecies';

const httpMergeOtherSpecies = HttpService.root(MERGE_OTHER_SPECIES_ENDPOINT);

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
  downloadSpeciesTemplate,
  getSpeciesProjects,
  getSpeciesUploadStatus,
  mergeOtherSpecies,
  resolveSpeciesUpload,
  suggestSpecies,
  uploadSpecies,
};

export default SpeciesService;
