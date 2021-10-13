import axios from '..';
import {
  Species,
  SpeciesDeleteResponse,
  speciesEndpoint,
  SpeciesListResponse,
  SpeciesPostRequestBody,
  SpeciesPostResponse,
  speciesPutEndpoint,
  SpeciesPutRequestBody,
  SpeciesPutResponse,
} from '../types/species';

export const getSpeciesList = async (): Promise<Species[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesEndpoint}`;
  const response: SpeciesListResponse = (await axios.get(endpoint)).data;

  return response.species.map((species) => ({
    id: species.id,
    name: species.name,
  }));
};

export const postSpecies = async (species: Species): Promise<Species> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesEndpoint}`;
  const createSpeciesRequest: SpeciesPostRequestBody = { name: species.name };
  const response: SpeciesPostResponse = (await axios.post(endpoint, createSpeciesRequest)).data;

  return { id: response.id, name: species.name };
};

export const updateSpecies = async (species: Species): Promise<SpeciesPutResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesPutEndpoint}`.replace('{speciesId}', `${species.id}`);
  const updateSpeciesRequest: SpeciesPutRequestBody = { name: species.name };
  const response: SpeciesPutResponse = (await axios.put(endpoint, updateSpeciesRequest)).data;

  return response;
};

export const deleteSpecies = async (speciesId: number): Promise<SpeciesDeleteResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesPutEndpoint}`.replace('{speciesId}', `${speciesId}`);
  const response: SpeciesDeleteResponse = (await axios.delete(endpoint)).data;

  return response;
};
