import axios from 'axios';
import { TokenResponse } from './types/auth';
import { SpeciesName, SpeciesResponseObject } from './types/species';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/species_names`;

export const getSpeciesNames = async (
  token: TokenResponse
): Promise<SpeciesName[]> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.species_names;
};

export const postSpeciesName = async (
  speciesName: SpeciesName,
  token: TokenResponse
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.post(endpoint, speciesName, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const putSpeciesName = async (
  speciesName: SpeciesName,
  token: TokenResponse
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}/${speciesName.id}`;

  return (
    await axios.put(endpoint, speciesName, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const deleteSpeciesName = async (
  speciesNameId: number,
  token: TokenResponse
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}/${speciesNameId}`;

  return (
    await axios.delete(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};
