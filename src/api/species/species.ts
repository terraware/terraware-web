import axios from 'src/api/index';
import { paths } from 'src/api/types/generated-schema';
import { Species, SpeciesRequestError } from 'src/types/Species';
import addQueryParams from '../helpers/addQueryParams';

/*
 * All functions in this module ALWAYS returns a promise that resolves. All errors will be caught and
 * surfaced to the caller via the requestSucceeded or error field.
 */

const GET_SPECIES_ENDPOINT = '/api/v1/species';

export type GetSpeciesListResponse = {
  species: Species[];
  requestSucceeded: boolean;
};

export async function getAllSpecies(organizationId: number): Promise<GetSpeciesListResponse> {
  const response: GetSpeciesListResponse = {
    species: [],
    requestSucceeded: true,
  };

  try {
    const endpoint = `${GET_SPECIES_ENDPOINT}?organizationId=${organizationId}`;
    const serverSpecies: Species[] = (await axios.get(endpoint)).data.species;
    serverSpecies.forEach((iSpecies: Species) => {
      response.species.push({
        id: iSpecies.id,
        commonName: iSpecies.commonName,
        endangered: iSpecies.endangered,
        rare: iSpecies.rare,
        familyName: iSpecies.familyName,
        growthForm: iSpecies.growthForm,
        scientificName: iSpecies.scientificName,
        seedStorageBehavior: iSpecies.seedStorageBehavior,
        problems: iSpecies.problems,
      });
    });
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.error(error);
    response.requestSucceeded = false;
  }

  return response;
}

const SPECIES_ENDPOINT = '/api/v1/species';
type PostSpeciesRequest = paths[typeof SPECIES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type PostSpeciesResponse = paths[typeof SPECIES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type CreateSpeciesResponse = {
  id: number;
  error: string | null;
};

export async function createSpecies(species: Species, organizationId: number): Promise<CreateSpeciesResponse> {
  const speciesToCreate: PostSpeciesRequest = {
    commonName: species.commonName,
    endangered: species.endangered,
    familyName: species.familyName,
    growthForm: species.growthForm,
    scientificName: species.scientificName,
    seedStorageBehavior: species.seedStorageBehavior,
    organizationId,
    rare: species.rare,
  };

  const response: CreateSpeciesResponse = {
    id: -1,
    error: null,
  };

  try {
    const serverResponse: PostSpeciesResponse = (await axios.post(SPECIES_ENDPOINT, speciesToCreate)).data;
    response.id = serverResponse.id;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      response.error = SpeciesRequestError.PreexistingSpecies;
    } else {
      response.error = SpeciesRequestError.RequestFailed;
    }
  }

  return response;
}

const PUT_SPECIES_ENDPOINT = '/api/v1/species/{speciesId}';
type PutSpeciesRequest = paths[typeof PUT_SPECIES_ENDPOINT]['put']['requestBody']['content']['application/json'];
type SimpleSuccessResponsePayload =
  paths[typeof PUT_SPECIES_ENDPOINT]['put']['responses']['200']['content']['application/json'];
/*
 * UpdateSpeciesResponse.species will always contain the data the caller attempted to write. The caller must examine
 * the requestSucceeded field to determine if the API call succeeded.
 */
export type UpdateSpeciesResponse = {
  requestSucceeded: boolean;
};

export async function updateSpecies(species: Species, organizationId: number): Promise<UpdateSpeciesResponse> {
  const response: UpdateSpeciesResponse = { requestSucceeded: true };
  const speciesToUpdate: PutSpeciesRequest = {
    commonName: species.commonName,
    endangered: species.endangered,
    familyName: species.familyName,
    growthForm: species.growthForm,
    scientificName: species.scientificName,
    organizationId,
    rare: species.rare,
    seedStorageBehavior: species.seedStorageBehavior,
  };
  try {
    const endpoint = PUT_SPECIES_ENDPOINT.replace('{speciesId}', `${species.id}`);
    const updateSpeciesNameResponse: SimpleSuccessResponsePayload = await axios.put(endpoint, speciesToUpdate);
    if (updateSpeciesNameResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.error(error);
    response.requestSucceeded = false;
  }

  return response;
}

type SpeciesDeleteResponse =
  paths[typeof PUT_SPECIES_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

export async function deleteSpecies(speciesId: number, organizationId: number): Promise<SpeciesDeleteResponse> {
  const endpoint = PUT_SPECIES_ENDPOINT.replace('{speciesId}', `${speciesId}`) + `?organizationId=${organizationId}`;
  const response: SpeciesDeleteResponse = (await axios.delete(endpoint)).data;

  return response;
}

const LOOKUP_SPECIES_ENDPOINT = '/api/v1/species/lookup/names';
type LookupSpeciesQuery = paths[typeof LOOKUP_SPECIES_ENDPOINT]['get']['parameters']['query'];
type GetSpeciesResponsePayload =
  paths[typeof LOOKUP_SPECIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type LookupSpeciesListResponse = {
  names: string[];
  requestSucceeded: boolean;
};

export async function listSpeciesNames(search: string) {
  const response: LookupSpeciesListResponse = {
    names: [],
    requestSucceeded: true,
  };
  if (search.length < 2) {
    return response;
  }
  const queryParams: LookupSpeciesQuery = { search };
  const endpoint = addQueryParams(LOOKUP_SPECIES_ENDPOINT, queryParams);
  try {
    const serverResponse = await axios.get(endpoint);
    const serverResponseData: GetSpeciesResponsePayload = serverResponse.data;
    if (serverResponseData.status !== 'error') {
      response.names = serverResponseData.names;
    } else {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

const LOOKUP_SPECIES_DETAILS_ENDPOINT = '/api/v1/species/lookup/details';
type LookupSpeciesDetailsQuery = paths[typeof LOOKUP_SPECIES_DETAILS_ENDPOINT]['get']['parameters']['query'];
type GetSpeciesDetailsResponsePayload =
  paths[typeof LOOKUP_SPECIES_DETAILS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CommonName = {
  name: string;
};
export type SpeciesDetailsResponse = {
  scientificName: string;
  commonNames: CommonName[];
  familyName: string;
  endangered?: boolean;
  /** If this is not the accepted name for the species, the type of problem the name has. Currently, this will always be "Name Is Synonym". */
  problemType?: 'Name Misspelled' | 'Name Not Found' | 'Name Is Synonym';
  /** If this is not the accepted name for the species, the name to suggest as an alternative. */
  suggestedScientificName?: string;
  requestSucceeded: boolean;
};

export async function getSpeciesDetails(scientificName: string) {
  const response: SpeciesDetailsResponse = {
    scientificName: '',
    commonNames: [],
    familyName: '',
    endangered: false,
    requestSucceeded: true,
  };
  const queryParams: LookupSpeciesDetailsQuery = { scientificName };
  try {
    const endpoint = addQueryParams(LOOKUP_SPECIES_DETAILS_ENDPOINT, queryParams);
    const serverResponse: GetSpeciesDetailsResponsePayload = (await axios.get(endpoint)).data;
    response.scientificName = serverResponse.scientificName;
    response.familyName = serverResponse.familyName;
    serverResponse.commonNames?.forEach((commonName) => {
      response.commonNames.push({
        name: commonName.name,
      });
    });
    response.endangered = serverResponse.endangered;
    response.problemType = serverResponse.problemType;
    response.suggestedScientificName = serverResponse.suggestedScientificName;
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

type UploadSpeciesResponse = {
  id: number;
  requestSucceeded: boolean;
};
const UPLOAD_SPECIES_FILE = '/api/v1/species/uploads';
type UploadSpeciesFileResponse =
  paths[typeof UPLOAD_SPECIES_FILE]['post']['responses'][200]['content']['application/json'];

export async function uploadSpeciesFile(file: File, organizationId: number) {
  const response: UploadSpeciesResponse = {
    id: -1,
    requestSucceeded: true,
  };
  const formData = new FormData();
  formData.append('organizationId', organizationId.toString());
  formData.append('file', file);
  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    },
  };
  try {
    const serverResponse: UploadSpeciesFileResponse = (await axios.post(UPLOAD_SPECIES_FILE, formData, config)).data;
    response.id = serverResponse.id;
  } catch (error) {
    response.requestSucceeded = false;
  }
  return response;
}

const DOWNLOAD_SPECIES_TEMPLATE = '/api/v1/species/uploads/template';
export async function downloadSpeciesTemplate() {
  const response = (await axios.get(DOWNLOAD_SPECIES_TEMPLATE)).data;
  return response;
}

const UPLOAD_STATUS = '/api/v1/species/uploads/{uploadId}';
export type GetSpeciesUploadStatusResponsePayload =
  paths[typeof UPLOAD_STATUS]['get']['responses'][200]['content']['application/json'];
export async function getUploadStatus(uploadId: number): Promise<GetSpeciesUploadStatusResponsePayload> {
  const serverResponse: GetSpeciesUploadStatusResponsePayload = (
    await axios.get(UPLOAD_STATUS.replace('{uploadId}', uploadId.toString()))
  ).data;
  return serverResponse;
}

const RESOLVE_SPECIES_UPLOAD = '/api/v1/species/uploads/{uploadId}/resolve';
export async function resolveSpeciesUpload(uploadId: number, overwriteExisting: boolean) {
  const response: UpdateSpeciesResponse = {
    requestSucceeded: true,
  };
  try {
    await axios.post(RESOLVE_SPECIES_UPLOAD.replace('{uploadId}', uploadId.toString()), { overwriteExisting });
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

const SPECIES_PROBLEM = '/api/v1/species/problems/{problemId}';
export async function acceptProblemSuggestion(problemId: number) {
  const response: UpdateSpeciesResponse = {
    requestSucceeded: true,
  };
  try {
    await axios.post(SPECIES_PROBLEM.replace('{problemId}', problemId.toString()));
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

export async function ignoreProblemSuggestion(problemId: number) {
  const response: UpdateSpeciesResponse = {
    requestSucceeded: true,
  };
  try {
    await axios.delete(SPECIES_PROBLEM.replace('{problemId}', problemId.toString()));
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}
