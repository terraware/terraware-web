import { components } from 'src/api/types/generated-schema';

export type AndNodePayload = components['schemas']['AndNodePayload'];
export type FieldNodePayload = components['schemas']['FieldNodePayload'];
export type NotNodePayload = components['schemas']['NotNodePayload'];
export type OrNodePayload = components['schemas']['OrNodePayload'];
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload'] };
export type SearchCriteria = { [key: string]: SearchNodePayload };
export type SearchSortOrder = components['schemas']['SearchSortOrderElement'];
export type SearchType = components['schemas']['FieldNodePayload']['type'];
export type SearchResponseElement = components['schemas']['SearchResponsePayload']['results'][0];
export type SearchResponseElementWithId = SearchResponseElement & { id: string };
export type SearchValuesResponseElement = components['schemas']['SearchValuesResponsePayload']['results'];
export type SearchValuesResponseElementWithId = SearchValuesResponseElement & { id: string };

export type FieldOptionsMap = { [key: string]: { partial: boolean; values: (string | null)[] } };

/** Search request payload that requires a search node to be specified. */
export type SearchRequestPayload = components['schemas']['SearchRequestPayload'] & { search: SearchNodePayload };
export type OptionalSearchRequestPayload = components['schemas']['SearchRequestPayload'];

export const isFieldNodePayload = (node: SearchNodePayload): node is FieldNodePayload => node.operation === 'field';
export const isNotNodePayload = (node: SearchNodePayload): node is NotNodePayload => node.operation === 'not';
export const isAndNodePayload = (node: SearchNodePayload): node is AndNodePayload => node.operation === 'and';
export const isOrNodePayload = (node: SearchNodePayload): node is OrNodePayload => node.operation === 'or';
