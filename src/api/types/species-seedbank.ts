import { components } from './generated-schema';

export type Species = components['schemas']['ListSpeciesResponsePayload']['values'];
export type SpeciesDetail = components['schemas']['SpeciesDetails'];

export type NewSpecieType = components['schemas']['CreateSpeciesRequestPayload'];
