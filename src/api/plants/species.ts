import axios from 'axios';
import { Species, SpeciesResponseObject } from '../types/species';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/species`;

export const postSpecies = async (species: Species): Promise<Species> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.post(endpoint, species)).data;
};

export const deleteSpecies = async (
  speciesId: number
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}/${speciesId}`;

  return (await axios.delete(endpoint)).data;
};
