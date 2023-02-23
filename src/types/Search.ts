import { components } from 'src/api/types/generated-schema';

export type AndNodePayload = components['schemas']['AndNodePayload'] & { operation: 'and' };
export type FieldNodePayload = components['schemas']['FieldNodePayload'] & { operation: 'field' };
export type NotNodePayload = components['schemas']['NotNodePayload'] & { operation: 'not' };
export type OrNodePayload = components['schemas']['OrNodePayload'] & { operation: 'or' };
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload'] };
export type SearchCriteria = Record<string, SearchNodePayload>;
export type SearchSortOrder = components['schemas']['SearchSortOrderElement'];
export type SearchResponseElement = components['schemas']['SearchResponsePayload']['results'][0];
