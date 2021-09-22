import { components } from './generated-schema-seedbank';

export type Species = components['schemas']['ListSpeciesResponsePayload']['values'];
export type SpeciesDetail = components['schemas']['SpeciesDetails'];

export type NewSpecieType = components['schemas']['CreateSpeciesRequestPayload'];
