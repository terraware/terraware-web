import axios from 'axios';
import { SpeciesType } from '../../types/SpeciesType';
import { components } from '../types/generated-schema-seedbank';

type SpeciesDetails = components['schemas']['SpeciesResponseElement'];
type SpeciesRequestPayload = components['schemas']['SpeciesRequestPayload'];

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/species`;

export const getSpeciesList = async (): Promise<SpeciesType[]> => {
  const speciesDetailsList: SpeciesDetails[] = (await axios.get(BASE_URL)).data
    .species;

  return speciesDetailsList.map((species: SpeciesDetails) => {
    return {
      id: species.id,
      name: species.name,
    };
  });
};

export const postSpecies = async (
  species: SpeciesType
): Promise<SpeciesType> => {
  const createSpeciesRequest: SpeciesRequestPayload = { name: species.name };
  const newId = (await axios.post(BASE_URL, createSpeciesRequest)).data.id;

  return { id: newId, name: species.name };
};

export const updateSpecies = async (
  species: SpeciesType
): Promise<SpeciesType> => {
  const updateSpeciesRequest: SpeciesRequestPayload = { name: species.name };
  await axios.put(`${BASE_URL}/${species.id}`, updateSpeciesRequest);

  return species; // api returns ok/error status, but doesn't return the data
};
