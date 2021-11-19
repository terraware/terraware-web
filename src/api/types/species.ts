import { paths } from './generated-schema';

export const speciesEndpoint = '/api/v1/species';
export type SpeciesListResponse = paths[typeof speciesEndpoint]['get']['responses'][200]['content']['application/json'];
export type SpeciesPostRequestBody =
  paths[typeof speciesEndpoint]['post']['requestBody']['content']['application/json'];
export type SpeciesPostResponse =
  paths[typeof speciesEndpoint]['post']['responses'][200]['content']['application/json'];

export const speciesPutEndpoint = '/api/v1/species/{speciesId}';
export type SpeciesPutRequestBody =
  paths[typeof speciesPutEndpoint]['put']['requestBody']['content']['application/json'];
export type SpeciesPutResponse =
  paths[typeof speciesPutEndpoint]['put']['responses'][200]['content']['application/json'];

export type SpeciesDeleteResponse =
  paths[typeof speciesPutEndpoint]['delete']['responses'][200]['content']['application/json'];

// The backend supports reading/writing other species information
// but we currently only need access to name and id
export type Species = {
  id?: number;
  name: string;
};
