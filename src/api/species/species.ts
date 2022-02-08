import axios from 'src/api/index';
import { paths } from 'src/api/types/generated-schema';
import {
  Species,
  SpeciesByIdWithScientificName,
  SpeciesRequestError,
  SpeciesWithScientificName,
} from 'src/types/Species';

/*
 * All functions in this module ALWAYS returns a promise that resolves. All errors will be caught and
 * surfaced to the caller via the requestSucceeded or error field.
 */

const SPECIES_NAME_ENDPOINT = '/api/v1/species/names';
type SpeciesList =
  paths[typeof SPECIES_NAME_ENDPOINT]['get']['responses'][200]['content']['application/json']['speciesNames'];
type SpeciesListItem = SpeciesList[0];

export type GetSpeciesListResponse = {
  speciesById: SpeciesByIdWithScientificName;
  requestSucceeded: boolean;
};

export async function getAllSpecies(organizationId: number): Promise<GetSpeciesListResponse> {
  const response: GetSpeciesListResponse = {
    speciesById: new Map(),
    requestSucceeded: true,
  };

  try {
    const endpoint = `${SPECIES_NAME_ENDPOINT}?organizationId=${organizationId}`;
    const speciesList: SpeciesList = (await axios.get(endpoint)).data.speciesNames;
    speciesList.forEach((species: SpeciesListItem) => {
      if (species.isScientific) {
        const commonName = response.speciesById.get(species.speciesId)?.name || '';
        response.speciesById.set(species.speciesId, {
          id: species.speciesId,
          name: commonName,
          scientificName: species.name,
        });
      } else {
        const scientificName = response.speciesById.get(species.speciesId)?.scientificName || '';
        response.speciesById.set(species.speciesId, {
          id: species.speciesId,
          name: species.name,
          scientificName,
        });
      }
    });
  } catch (error) {
    console.error(error);
    // Don't return a partially filled map;
    response.speciesById = new Map();
    response.requestSucceeded = false;
  }

  return response;
}
type PostSpeciesNameRequest = paths[typeof SPECIES_NAME_ENDPOINT]['post']['requestBody']['content']['application/json'];
type PostSpeciesNameResponse =
  paths[typeof SPECIES_NAME_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type CreateSpeciesNamesResponse = {
  requestSucceeded: boolean;
};

export async function createSpeciesNames(
  name: string,
  organizationId: number,
  speciesId: number,
  isScientific: boolean
): Promise<CreateSpeciesNamesResponse> {
  const response: CreateSpeciesNamesResponse = {
    requestSucceeded: true,
  };

  try {
    const createSpeciesNamesRequest: PostSpeciesNameRequest = { name, organizationId, speciesId, isScientific };
    const serverResponse: PostSpeciesNameResponse = (await axios.post(SPECIES_NAME_ENDPOINT, createSpeciesNamesRequest))
      .data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch (error) {
    response.requestSucceeded = false;
  }

  return response;
}

const SPECIES_ENDPOINT = '/api/v1/species';
type PostSpeciesRequest = paths[typeof SPECIES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type PostSpeciesResponse = paths[typeof SPECIES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type CreateSpeciesResponse = {
  species: Species | null;
  error: string | null;
};

export async function createSpecies(
  species: SpeciesWithScientificName,
  organizationId: number
): Promise<CreateSpeciesResponse> {
  const response: CreateSpeciesResponse = {
    species: null,
    error: null,
  };

  try {
    const createSpeciesRequest: PostSpeciesRequest = { name: species.name, organizationId };
    const serverResponse: PostSpeciesResponse = (await axios.post(SPECIES_ENDPOINT, createSpeciesRequest)).data;
    response.species = { id: serverResponse.id } as SpeciesWithScientificName;
    if (serverResponse.id && species.scientificName) {
      const createSpeciesResponse = await createSpeciesNames(
        species.scientificName,
        organizationId,
        serverResponse.id,
        true
      );
      if (!createSpeciesResponse.requestSucceeded) {
        response.error = SpeciesRequestError.RequestFailed;
      }
    }
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
  species: Species;
  requestSucceeded: boolean;
};

export async function updateSpecies(
  species: SpeciesWithScientificName,
  organizationId: number
): Promise<UpdateSpeciesResponse> {
  const response: UpdateSpeciesResponse = { species, requestSucceeded: true };

  try {
    const endpoint = PUT_SPECIES_ENDPOINT.replace('{speciesId}', `${species.id}`);
    const updateSpeciesNameRequest: PutSpeciesRequest = { name: species.name, organizationId };
    const updateSpeciesNameResponse: SimpleSuccessResponsePayload = await axios.put(endpoint, updateSpeciesNameRequest);
    if (updateSpeciesNameResponse.status !== 'error') {
      if (species.scientificName) {
        const updateScientificNameResponse = await updateScientificName(
          species.scientificName,
          species.id,
          organizationId
        );
        if (!updateScientificNameResponse.requestSucceeded) {
          response.requestSucceeded = false;
        }
      }
    }
  } catch (error) {
    console.error(error);
    response.requestSucceeded = false;
  }

  return response;
}

const SPECIES_NAMES_OF_SPECIES = '/api/v1/species/{speciesId}/names';
type SpeciesNamesList =
  paths[typeof SPECIES_NAMES_OF_SPECIES]['get']['responses'][200]['content']['application/json']['speciesNames'];

const PUT_SPECIES_NAME_ENDPOINT = '/api/v1/species/names/{speciesNameId}';

type PutSpeciesNamesRequest =
  paths[typeof PUT_SPECIES_NAME_ENDPOINT]['put']['requestBody']['content']['application/json'];

export type SimpleUpdateSpeciesResponse = {
  requestSucceeded: boolean;
};

export async function updateScientificName(
  scientificName: string,
  speciesId: number,
  organizationId: number
): Promise<SimpleUpdateSpeciesResponse> {
  const response: SimpleUpdateSpeciesResponse = { requestSucceeded: true };

  try {
    const speciesNames: SpeciesNamesList = (
      await axios.get(
        SPECIES_NAMES_OF_SPECIES.replace('{speciesId}', speciesId.toString()).concat(
          `?organizationId=${organizationId}`
        )
      )
    ).data.speciesNames;
    const scientificNames = speciesNames.filter((name) => name.isScientific);
    const scientificNameOfSpecies = scientificNames[0];
    if (scientificNameOfSpecies) {
      const endpoint = PUT_SPECIES_NAME_ENDPOINT.replace('{speciesNameId}', `${scientificNameOfSpecies.id}`).concat(
        `?organizationId=${organizationId}`
      );
      const updateSpeciesNamesRequest: PutSpeciesNamesRequest = { name: scientificName, speciesId, isScientific: true };
      await axios.put(endpoint, updateSpeciesNamesRequest);
    } else {
      const responseCreate = await createSpeciesNames(scientificName, organizationId, speciesId, true);
      if (!responseCreate.requestSucceeded) {
        response.requestSucceeded = false;
      }
    }
  } catch (error) {
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
