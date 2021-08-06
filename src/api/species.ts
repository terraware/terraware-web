import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Species, SpeciesResponseObject } from './types/species';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/species`;

export const postSpecies = async (
  species: Species,
  token: TokenResponse
): Promise<Species> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.post(endpoint, species, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const deleteSpecies = async (
  speciesId: number,
  token: TokenResponse
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}/${speciesId}`;

  return (
    await axios.delete(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};
