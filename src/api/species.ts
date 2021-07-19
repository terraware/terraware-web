import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Species } from './types/species';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/species`;

export const getSpecies = async (): Promise<Species[]> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwIjoxNjI2MTA0NTk1fQ.tmnRTAsE5YRotNMX-ZR9KpgDsG3Eubc_3NWynTjR3XQ',
      },
    })
  ).data.species;
};

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
