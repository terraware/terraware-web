import { components } from './generated-schema';

export type Species = components['schemas']['Species'];

export type SpeciesName = components['schemas']['SpeciesName'];

export type SpeciesResponseObject = {
  id: number;
};

export type SpeciesForChart = {
  speciesName: SpeciesName;
  numberOfTrees: number;
  color: string;
};
