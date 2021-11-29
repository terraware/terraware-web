import { SpeciesRequestError } from 'src/types/Species';
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

export type PostSpeciesResponse = {
  species?: Species;
  error?: string;
};

export const getSpeciesList = async (): Promise<Species[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesEndpoint}`;
  const response: SpeciesListResponse = (await axios.get(endpoint)).data;

  return response.species.map((species) => ({
    id: species.id,
    name: species.name,
  }));
};

export const postSpecies = async (species: Species): Promise<PostSpeciesResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesEndpoint}`;
  const createSpeciesRequest: SpeciesPostRequestBody = { name: species.name };

  const response: PostSpeciesResponse = {};

  try {
    const apiResponse: SpeciesPostResponse = (await axios.post(endpoint, createSpeciesRequest)).data;
    response.species = {
      id: apiResponse.id,
      name: species.name,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      response.error = SpeciesRequestError.ExistentSpecies;
    } else {
      response.error = SpeciesRequestError.RequestFailed;
    }
  }

  return response;
};

export const updateSpecies = async (species: Species): Promise<SpeciesPutResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesPutEndpoint}`.replace(
    '{speciesId}',
    `${species.id}`
  );
  const updateSpeciesRequest: SpeciesPutRequestBody = { name: species.name };
  const response: SpeciesPutResponse = (await axios.put(endpoint, updateSpeciesRequest)).data;

  return response;
};

export const deleteSpecies = async (speciesId: number): Promise<SpeciesDeleteResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${speciesPutEndpoint}`.replace('{speciesId}', `${speciesId}`);
  const response: SpeciesDeleteResponse = (await axios.delete(endpoint)).data;

  return response;
};
