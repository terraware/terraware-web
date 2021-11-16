import axios from 'src/api/index';
import {paths} from 'src/api/types/generated-schema';
import {Species, SpeciesById} from 'src/types/Species';

/*
 * All functions in this module ALWAYS returns a promise that resolves. All errors will be caught and
 * surfaced to the caller via the requestSucceeded field.
 */

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

const SPECIES_ENDPOINT = '/api/v1/species';
type SpeciesList = paths[typeof SPECIES_ENDPOINT]['get']['responses'][200]['content']['application/json']['species'];
type SpeciesListItem = SpeciesList[0];

export type GetSpeciesListResponse = {
  speciesById: SpeciesById,
  requestSucceeded: boolean,
};

export async function getAllSpecies(): Promise<GetSpeciesListResponse> {
  const response: GetSpeciesListResponse = {
    speciesById: new Map(),
    requestSucceeded: true,
  };

  try {
    const endpoint = `${BASE_URL}${SPECIES_ENDPOINT}`;
    const speciesList: SpeciesList = (await axios.get(endpoint)).data.species;
    speciesList.forEach((species: SpeciesListItem) => {
      response.speciesById.set(species.id, {id: species.id, name: species.name});
    });
  } catch(error) {
    console.error(error);
    // Don't return a partially filled map;
    response.speciesById = new Map();
    response.requestSucceeded = false;
  }

  return response;
}

type PostSpeciesRequest = paths[typeof SPECIES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type PostSpeciesResponse = paths[typeof SPECIES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type CreateSpeciesResponse = {
  species: Species | null;
  requestSucceeded: boolean;
};

export async function createSpecies(name: string): Promise<CreateSpeciesResponse> {
  const response: CreateSpeciesResponse = {
    species: null,
    requestSucceeded: true,
  };

  try {
    const endpoint = `${BASE_URL}${SPECIES_ENDPOINT}`;
    const createSpeciesRequest: PostSpeciesRequest = { name };
    const serverResponse: PostSpeciesResponse = (await axios.post(endpoint, createSpeciesRequest)).data;
    response.species = { id: serverResponse.id, name };
  } catch(error) {
    console.error(error);
    response.species = null;
    response.requestSucceeded = false;
  }

  return response;
}

const PUT_SPECIES_ENDPOINT = '/api/v1/species/{speciesId}';
type PutSpeciesRequest = paths[typeof PUT_SPECIES_ENDPOINT]['put']['requestBody']['content']['application/json'];

/*
 * UpdateSpeciesResponse.species will always contain the data the caller attempted to write. The caller must examine
 * the requestSucceeded field to determine if the API call succeeded.
 */
export type UpdateSpeciesResponse = {
  species: Species;
  requestSucceeded: boolean;
};

export async function updateSpecies(species: Species): Promise<UpdateSpeciesResponse> {
  const response: UpdateSpeciesResponse = { species, requestSucceeded: true };

  try {
    const endpoint = `${BASE_URL}${PUT_SPECIES_ENDPOINT}`.replace('{speciesId}', `${species.id}`);
    const updateSpeciesRequest: PutSpeciesRequest = { name: species.name };
    await axios.put(endpoint, updateSpeciesRequest);
  } catch(error) {
    console.error(error);
    response.requestSucceeded = false;
  }

  return response;
}
