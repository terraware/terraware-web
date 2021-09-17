import axios from 'axios';
import {
  NewSpecieType,
  Species,
  SpeciesDetail,
} from './types/species-seedbank';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank`;

export const getSpecies = async (): Promise<Species> => {
  const endpoint = `${BASE_URL}/values/species`;
  return (await axios.get(endpoint)).data.values;
};

export const postSpecies = async (
  species: NewSpecieType
): Promise<SpeciesDetail> => {
  const endpoint = `${BASE_URL}/values/species`;
  return (await axios.post(endpoint, species)).data.details;
};

export const updateSpecies = async (
  id: number,
  params: NewSpecieType
): Promise<SpeciesDetail> => {
  const endpoint = `${BASE_URL}/values/species/${id}`;
  return (await axios.post(endpoint, params)).data.details;
};
