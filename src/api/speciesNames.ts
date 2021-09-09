import axios from 'axios';
import { SpeciesName, SpeciesResponseObject } from './types/species';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/species_names`;

export const getSpeciesNames = async (): Promise<SpeciesName[]> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.get(endpoint)).data.species_names;
};

export const postSpeciesName = async (
  speciesName: SpeciesName
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.post(endpoint, speciesName)).data;
};

export const putSpeciesName = async (
  speciesName: SpeciesName
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}/${speciesName.id}`;

  return (await axios.put(endpoint, speciesName)).data;
};

export const deleteSpeciesName = async (
  speciesNameId: number
): Promise<SpeciesResponseObject> => {
  const endpoint = `${BASE_URL}/${speciesNameId}`;

  return (await axios.delete(endpoint)).data;
};
