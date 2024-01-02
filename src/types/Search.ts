import { components } from 'src/api/types/generated-schema';

export type AndNodePayload = components['schemas']['AndNodePayload'];
export type FieldNodePayload = components['schemas']['FieldNodePayload'];
export type NotNodePayload = components['schemas']['NotNodePayload'];
export type OrNodePayload = components['schemas']['OrNodePayload'];
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload'] };
export type SearchCriteria = { [key: string]: SearchNodePayload };
export type SearchSortOrder = components['schemas']['SearchSortOrderElement'];
export type SearchResponseElement = components['schemas']['SearchResponsePayload']['results'][0];
export type SearchResponseElementWithId = SearchResponseElement & { id: string };

export type FieldOptionsMap = { [key: string]: { partial: boolean; values: (string | null)[] } };

/** Search request payload that requires a search node to be specified. */
export type SearchRequestPayload = components['schemas']['SearchRequestPayload'] & { search: SearchNodePayload };
