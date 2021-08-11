import { components } from './generated-schema';

export type Plant = components['schemas']['Plant'];

export type PlantSummary = { 'species_id': number; 'count': number };
